// src/database/entities/Employer.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("employers")
export class Employer {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "user_id", unique: true })
  userId!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "company_name" })
  companyName!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ name: "company_description", type: "text", nullable: true })
  companyDescription?: string;

  @Column({ name: "company_website", nullable: true })
  companyWebsite?: string;

  @Column({ name: "company_logo_url", nullable: true })
  companyLogoUrl?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
