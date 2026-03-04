import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeedEvent } from './feed-event.entity';
import { FeedEventType } from './feed-event-type.enum';
import { UserFollow } from '../users/user-follow.entity';
import { FeedService, encodeCursor, decodeCursor } from './feed.service';
import { User } from '../users/user.entity';
import { Game } from '../games/game.entity';

describe('FeedService', () => {
  let service: FeedService;

  const mockFeedEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserFollowRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: getRepositoryToken(FeedEvent), useValue: mockFeedEventRepository },
        { provide: getRepositoryToken(UserFollow), useValue: mockUserFollowRepository },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
  });

  describe('encodeCursor / decodeCursor', () => {
    it('encodes and decodes cursor correctly', () => {
      const at = new Date('2025-03-04T12:00:00.000Z');
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const encoded = encodeCursor(at, id);
      expect(encoded).toBe('2025-03-04T12:00:00.000Z:123e4567-e89b-12d3-a456-426614174000');
      const decoded = decodeCursor(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded!.createdAt.getTime()).toBe(at.getTime());
      expect(decoded!.id).toBe(id);
    });

    it('returns null for invalid cursor', () => {
      expect(decodeCursor('')).toBeNull();
      expect(decodeCursor('no-colon')).toBeNull();
      expect(decodeCursor('invalid-date:uuid')).toBeNull();
    });
  });

  describe('getFollowerIds', () => {
    it('returns follower user IDs for a user', async () => {
      mockUserFollowRepository.find.mockResolvedValue([
        { followerId: 'f1' },
        { followerId: 'f2' },
      ]);
      const ids = await service.getFollowerIds('user1');
      expect(ids).toEqual(['f1', 'f2']);
      expect(mockUserFollowRepository.find).toHaveBeenCalledWith({
        where: { followingId: 'user1' },
        select: ['followerId'],
      });
    });
  });

  describe('emitFollowEvents', () => {
    it('creates two feed events (YOU_FOLLOWED and FOLLOWED_YOU)', async () => {
      const createMock = (attrs: Partial<FeedEvent>) => ({ id: 'e1', ...attrs });
      mockFeedEventRepository.create.mockImplementation(createMock);
      mockFeedEventRepository.save.mockImplementation((e: FeedEvent) => Promise.resolve(e));

      await service.emitFollowEvents('actor-id', 'target-id');

      expect(mockFeedEventRepository.save).toHaveBeenCalledTimes(2);
      const calls = mockFeedEventRepository.create.mock.calls.map(
        (args: Partial<FeedEvent>[]) => ({ id: 'e1', ...args[0] } as FeedEvent),
      );
      expect(calls).toHaveLength(2);
      const youFollowed = calls.find((c) => c.type === FeedEventType.YOU_FOLLOWED);
      const followedYou = calls.find((c) => c.type === FeedEventType.FOLLOWED_YOU);
      expect(youFollowed).toBeDefined();
      expect(youFollowed!.visibilityUserId).toBe('actor-id');
      expect(followedYou).toBeDefined();
      expect(followedYou!.visibilityUserId).toBe('target-id');
    });
  });

  describe('emitListOrPlayLogEvent', () => {
    it('creates one event for actor and one per follower (fan-out)', async () => {
      mockFeedEventRepository.create.mockImplementation((attrs: Partial<FeedEvent>) => ({ id: 'e1', ...attrs }));
      mockFeedEventRepository.save.mockImplementation((e: FeedEvent | FeedEvent[]) =>
        Array.isArray(e) ? Promise.resolve(e) : Promise.resolve(e),
      );
      mockUserFollowRepository.find.mockResolvedValue([{ followerId: 'f1' }, { followerId: 'f2' }]);

      await service.emitListOrPlayLogEvent({
        type: FeedEventType.ADDED_TO_WISHLIST,
        actorUserId: 'actor-id',
        gameId: 'game-id',
      });

      expect(mockFeedEventRepository.save).toHaveBeenCalledTimes(2); // first single, then array
      const firstCall = mockFeedEventRepository.save.mock.calls[0][0];
      expect(firstCall.visibilityUserId).toBe('actor-id');
      expect(firstCall.type).toBe(FeedEventType.ADDED_TO_WISHLIST);
      const secondCall = mockFeedEventRepository.save.mock.calls[1][0];
      expect(Array.isArray(secondCall)).toBe(true);
      expect((secondCall as FeedEvent[]).length).toBe(2);
      expect((secondCall as FeedEvent[]).map((e) => e.visibilityUserId)).toEqual(['f1', 'f2']);
    });
  });

  describe('getFeedForUser', () => {
    it('returns events for visibilityUserId only, newest first, with limit and nextCursor', async () => {
      const actor = { id: 'a1', username: 'alice', displayName: 'Alice', avatarUrl: null } as User;
      const events = [
        {
          id: 'ev1',
          type: FeedEventType.ADDED_TO_WISHLIST,
          createdAt: new Date('2025-03-04T12:00:00.000Z'),
          actorUserId: 'a1',
          targetUserId: null,
          gameId: 'g1',
          playLogId: null,
          visibilityUserId: 'current',
          actorUser: actor,
          targetUser: null,
          game: { id: 'g1', name: 'Catan', imageUrl: null } as Game,
        } as unknown as FeedEvent,
        {
          id: 'ev2',
          type: FeedEventType.YOU_FOLLOWED,
          createdAt: new Date('2025-03-04T11:00:00.000Z'),
          actorUserId: 'current',
          targetUserId: 'a1',
          gameId: null,
          playLogId: null,
          visibilityUserId: 'current',
          actorUser: actor,
          targetUser: { id: 'a1', username: 'alice', displayName: 'Alice', avatarUrl: null },
          game: null,
        } as unknown as FeedEvent,
      ];

      const getMany = jest.fn().mockResolvedValue(events);
      mockFeedEventRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany,
      });

      const result = await service.getFeedForUser('current', 20, undefined);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].type).toBe(FeedEventType.ADDED_TO_WISHLIST);
      expect(result.items[0].createdAt).toBe('2025-03-04T12:00:00.000Z');
      expect(result.items[1].type).toBe(FeedEventType.YOU_FOLLOWED);
      expect(result.items[1].text).toContain('You followed');
      expect(result.nextCursor).toBeNull(); // only 2 items, limit 20
    });

    it('caps limit at MAX_LIMIT (50)', async () => {
      const getMany = jest.fn().mockResolvedValue([]);
      const take = jest.fn().mockReturnThis();
      mockFeedEventRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take,
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany,
      });

      await service.getFeedForUser('current', 100, undefined);

      expect(take).toHaveBeenCalledWith(51); // 50 + 1 for hasNext
    });
  });
});
