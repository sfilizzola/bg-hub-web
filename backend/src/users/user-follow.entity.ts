import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_follows' })
@Unique('UQ_user_follow_follower_following', ['followerId', 'followingId'])
export class UserFollow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'follower_id', type: 'uuid' })
  followerId!: string;

  @Column({ name: 'following_id', type: 'uuid' })
  followingId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower!: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following!: User;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;
}
