import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'games' })
@Unique('UQ_games_apiRef_externalId', ['apiRef', 'externalId'])
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  externalId!: string;

  @Column({ type: 'varchar' })
  apiRef!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null = null;

  @Column({ type: 'int', nullable: true })
  year: number | null = null;

  @Column({ type: 'int', nullable: true })
  minPlayers: number | null = null;

  @Column({ type: 'int', nullable: true })
  maxPlayers: number | null = null;

  @Column({ type: 'int', nullable: true })
  playTime: number | null = null;

  @Column({ type: 'float', nullable: true })
  complexityWeight: number | null = null;

  @Column({ type: 'jsonb', nullable: true })
  categories: string[] | null = null;

  @Column({ type: 'jsonb', nullable: true })
  mechanics: string[] | null = null;

  @Column({ type: 'text', nullable: true })
  description: string | null = null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  updatedAt!: Date;
}

