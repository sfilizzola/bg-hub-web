import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Game } from '../games/game.entity';
import { FeedEventType } from './feed-event-type.enum';

/**
 * A single feed event visible to a specific user (visibilityUserId).
 * Fan-out on write: one row per (event content, viewer) for list/playlog events.
 *
 * Privacy: When private/approved follow is implemented, only create events for
 * users that the actor allows to see their activity. For MVP we use existing
 * follow relations only (TODO: enforce approved follow when available).
 *
 * Future: For likes/comments, add nullable counts or a separate reaction table
 * and expose via API without changing this entity's core fields.
 */
@Entity({ name: 'feed_events' })
@Index('IDX_feed_events_visibility_user_id_created_at', ['visibilityUserId', 'createdAt'])
@Index('IDX_feed_events_actor_user_id', ['actorUserId'])
@Index('IDX_feed_events_created_at', ['createdAt'])
export class FeedEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'enum', enum: FeedEventType, enumName: 'feed_event_type_enum' })
  type!: FeedEventType;

  /** User who performed the action (e.g. follower, or user who added game). */
  @Column({ type: 'uuid', name: 'actor_user_id' })
  actorUserId!: string;

  /** Target user when applicable (e.g. follow target, or currentUser for FOLLOWED_YOU). */
  @Column({ type: 'uuid', name: 'target_user_id', nullable: true })
  targetUserId!: string | null;

  @Column({ type: 'uuid', name: 'game_id', nullable: true })
  gameId!: string | null;

  @Column({ type: 'uuid', name: 'play_log_id', nullable: true })
  playLogId!: string | null;

  /** Extensibility: e.g. username/game name snapshots, or future reaction counts. */
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  /**
   * User who should see this event in their feed. Enables efficient "feed for currentUser" query.
   */
  @Column({ type: 'uuid', name: 'visibility_user_id' })
  visibilityUserId!: string;

  // --- Placeholder for future likes/comments (do not implement endpoints yet) ---
  // @Column({ type: 'int', default: 0, name: 'like_count', nullable: true }) likeCount?: number | null;
  // @Column({ type: 'int', default: 0, name: 'comment_count', nullable: true }) commentCount?: number | null;
  // Or a separate FeedEventReaction table with TODO.

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser!: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_user_id' })
  targetUser!: User | null;

  @ManyToOne(() => Game, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'game_id' })
  game!: Game | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visibility_user_id' })
  visibilityUser!: User;
}
