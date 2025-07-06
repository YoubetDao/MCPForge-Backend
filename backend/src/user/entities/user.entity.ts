import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AuthMethod } from './auth-method.entity';

export enum UserRole {
  USER = 'user',
  DEVELOPER = 'developer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ nullable: true })
  reward_address: string;

  @OneToMany(() => AuthMethod, authMethod => authMethod.user)
  auth_methods: AuthMethod[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
