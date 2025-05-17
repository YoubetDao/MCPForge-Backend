import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class McpCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: "json", nullable: true })
  tags: string[];

  @Column()
  github_url: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, type: "text" })
  overview: string;

  @Column({ type: "text", nullable: true })
  tools: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: "json", nullable: true })
  configs: object;

  @Column({ nullable: true })
  docker_image: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
