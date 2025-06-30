import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Exclude } from "class-transformer";
import { UserRole } from "../../../constants/enum";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "full_name" })
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude() // hide from output
  password!: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.JOB_SEEKER })
  role!: UserRole;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
