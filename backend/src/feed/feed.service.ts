import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedEvent } from './feed-event.entity';
import { FeedEventType } from './feed-event-type.enum';
import { UserFollow } from '../users/user-follow.entity';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/** Cursor format: createdAt (ISO) + id, base64 or simple concatenation. We use "createdAt:id". */
export function encodeCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}:${id}`;
}

export function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  // ISO date contains colons (e.g. 12:00:00.000Z); UUID does not. Split on last colon.
  const sep = cursor.lastIndexOf(':');
  if (sep === -1) return null;
  const createdAt = cursor.slice(0, sep);
  const id = cursor.slice(sep + 1);
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime()) || !id) return null;
  return { createdAt: date, id };
}

export interface FeedItemDto {
  id: string;
  type: FeedEventType;
  createdAt: string;
  actor: { id: string; username: string; displayName: string | null; imageUrl: string | null };
  targetUser?: { id: string; username: string; displayName: string | null; imageUrl: string | null };
  game?: { id: string; name: string; imageUrl: string | null };
  playLogId?: string;
  text: string;
}

export interface GetFeedResult {
  items: FeedItemDto[];
  nextCursor: string | null;
}

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedEvent)
    private readonly feedEventRepository: Repository<FeedEvent>,
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
  ) {}

  /**
   * Returns user IDs of users who follow the given user (followers of userId).
   * Used for fan-out: when userId does something, their followers see it.
   * TODO: When private/approved follow exists, filter to approved followers only.
   */
  async getFollowerIds(userId: string): Promise<string[]> {
    const rows = await this.userFollowRepository.find({
      where: { followingId: userId },
      select: ['followerId'],
    });
    return rows.map((r) => r.followerId);
  }

  /** Emit feed events when currentUser follows targetUser. Creates two events. */
  async emitFollowEvents(actorUserId: string, targetUserId: string): Promise<void> {
    const [forActor, forTarget] = await Promise.all([
      this.feedEventRepository.save(
        this.feedEventRepository.create({
          type: FeedEventType.YOU_FOLLOWED,
          actorUserId,
          targetUserId,
          visibilityUserId: actorUserId,
        }),
      ),
      this.feedEventRepository.save(
        this.feedEventRepository.create({
          type: FeedEventType.FOLLOWED_YOU,
          actorUserId,
          targetUserId,
          visibilityUserId: targetUserId,
        }),
      ),
    ]);
    void forActor;
    void forTarget;
  }

  /**
   * Emit feed events for list/playlog activity: one for the actor's feed and one per follower (fan-out).
   * Only users that follow the actor see the event; actor always sees their own.
   */
  async emitListOrPlayLogEvent(params: {
    type: FeedEventType.ADDED_TO_WISHLIST | FeedEventType.ADDED_TO_COLLECTION | FeedEventType.PLAYLOG_CREATED;
    actorUserId: string;
    gameId?: string;
    playLogId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { type, actorUserId, gameId, playLogId, metadata } = params;
    // Event for the actor (currentUser) so they see their own activity
    const forActor = this.feedEventRepository.create({
      type,
      actorUserId,
      targetUserId: null,
      gameId: gameId ?? null,
      playLogId: playLogId ?? null,
      metadata: metadata ?? null,
      visibilityUserId: actorUserId,
    });
    await this.feedEventRepository.save(forActor);

    const followerIds = await this.getFollowerIds(actorUserId);
    if (followerIds.length === 0) return;

    const forFollowers = followerIds.map((visibilityUserId) =>
      this.feedEventRepository.create({
        type,
        actorUserId,
        targetUserId: null,
        gameId: gameId ?? null,
        playLogId: playLogId ?? null,
        metadata: metadata ?? null,
        visibilityUserId,
      }),
    );
    await this.feedEventRepository.save(forFollowers);
  }

  /**
   * Get feed for currentUser: text-only, newest-first, cursor-based pagination.
   * Privacy: events are already stored per visibilityUserId; when private/approved
   * is implemented, emission should only create events for allowed viewers (TODO).
   */
  async getFeedForUser(
    currentUserId: string,
    limit: number = DEFAULT_LIMIT,
    cursor: string | undefined,
  ): Promise<GetFeedResult> {
    const take = Math.min(Math.max(1, limit), MAX_LIMIT) + 1; // fetch one extra to detect hasNext
    const qb = this.feedEventRepository
      .createQueryBuilder('e')
      .where('e.visibilityUserId = :currentUserId', { currentUserId })
      .orderBy('e.createdAt', 'DESC')
      .addOrderBy('e.id', 'DESC')
      .take(take);

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        qb.andWhere(
          '(e.createdAt, e.id) < (:cursorAt, :cursorId)',
          { cursorAt: decoded.createdAt, cursorId: decoded.id },
        );
      }
    }

    const events = await qb
      .leftJoinAndSelect('e.actorUser', 'actor')
      .leftJoinAndSelect('e.targetUser', 'target')
      .leftJoinAndSelect('e.game', 'game')
      .getMany();

    const hasNext = events.length > limit;
    const page = hasNext ? events.slice(0, limit) : events;
    const nextCursor =
      hasNext && page.length > 0
        ? encodeCursor(page[page.length - 1].createdAt, page[page.length - 1].id)
        : null;

    const items: FeedItemDto[] = page.map((e) => {
      const actor = e.actorUser;
      const target = e.targetUser ?? undefined;
      const game = e.game ?? undefined;
      const text = this.formatFeedText(e.type, actor?.username, target?.username, game?.name);
      return {
        id: e.id,
        type: e.type,
        createdAt: e.createdAt.toISOString(),
        actor: {
          id: actor?.id ?? e.actorUserId,
          username: actor?.username ?? '?',
          displayName: actor?.displayName ?? null,
          imageUrl: actor?.avatarUrl ?? null,
        },
        ...(target && {
          targetUser: {
            id: target.id,
            username: target.username,
            displayName: target.displayName ?? null,
            imageUrl: target.avatarUrl ?? null,
          },
        }),
        ...(game && {
          game: {
            id: game.id,
            name: game.name,
            imageUrl: game.imageUrl ?? null,
          },
        }),
        ...(e.playLogId && { playLogId: e.playLogId }),
        text,
      };
    });

    return { items, nextCursor };
  }

  private formatFeedText(
    type: FeedEventType,
    actorUsername?: string,
    targetUsername?: string,
    gameName?: string,
  ): string {
    switch (type) {
      case FeedEventType.FOLLOWED_YOU:
        return `${actorUsername ?? 'Someone'} followed you`;
      case FeedEventType.YOU_FOLLOWED:
        return `You followed ${targetUsername ?? 'someone'}`;
      case FeedEventType.ADDED_TO_WISHLIST:
        return `${actorUsername ?? 'Someone'} added ${gameName ?? 'a game'} to wishlist`;
      case FeedEventType.ADDED_TO_COLLECTION:
        return `${actorUsername ?? 'Someone'} added ${gameName ?? 'a game'} to collection`;
      case FeedEventType.PLAYLOG_CREATED:
        return `${actorUsername ?? 'Someone'} logged a play of ${gameName ?? 'a game'}`;
      default:
        return 'Activity';
    }
  }
}
