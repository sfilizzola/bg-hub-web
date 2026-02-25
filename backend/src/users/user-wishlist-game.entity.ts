import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Game } from '../games/game.entity';

@Entity({ name: 'user_wishlist_games' })
@Unique('UQ_user_wishlist_game_user_game', ['userId', 'gameId'])
export class UserWishlistGame {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  gameId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game!: Game;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;
}

