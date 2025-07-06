import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum AuthType {
  WEB3 = 'web3',
  GOOGLE = 'google',
  GITHUB = 'github',
}

@Entity('auth_methods')
@Unique(['auth_type', 'auth_identifier'])
export class AuthMethod {
  @PrimaryGeneratedColumn()
  auth_id: number;

  @Column()
  user_id: number;

  @Column({
    type: 'enum',
    enum: AuthType,
  })
  auth_type: AuthType;

  @Column()
  auth_identifier: string;

  @ManyToOne(() => User, user => user.auth_methods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
} 