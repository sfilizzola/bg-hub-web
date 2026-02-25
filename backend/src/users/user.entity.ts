import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', unique: true })
  username!: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash!: string;

  @Column({ name: 'trusted_user', type: 'boolean', default: false })
  trustedUser!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt!: Date;

  @BeforeInsert()
  setIdAndTimestamps() {
    if (!this.id) {
      this.id = randomUUID();
    }
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}

