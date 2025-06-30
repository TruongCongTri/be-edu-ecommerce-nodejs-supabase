// src/database/entities/Skill.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { Job } from "./Job";
import { JobSeeker } from "./JobSeeker";

@Entity("skills")
export class Skill {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ name: "slug", unique: true })
  slug!: string;

  @ManyToMany(() => JobSeeker, (jobSeeker) => jobSeeker.skills)
  jobSeekers!: JobSeeker[];

  @ManyToMany(() => Job, (job) => job.skills)
  jobs!: Job[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
