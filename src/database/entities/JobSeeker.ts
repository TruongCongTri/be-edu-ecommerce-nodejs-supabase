// src/database/entities/JobSeeker.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Skill } from "./Skill";
import { Application } from "./Application";

@Entity("job_seekers")
export class JobSeeker {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", unique: true })
  userId!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "resume_url", nullable: true })
  resumeUrl?: string;

  @ManyToMany(() => Skill, (skill) => skill.jobSeekers)
  @JoinTable({
    name: "job_seekers_skills",
    joinColumn: { name: "job_seeker_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "skill_id", referencedColumnName: "id" },
  })
  skills!: Skill[];

  @Column({ name: "experience_years", type: "int", nullable: true })
  experienceYears?: number;

  @Column({ name: "desired_salary", type: "decimal", nullable: true })
  desiredSalary?: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Application, (application) => application.jobSeeker)
  applications!: Application[];
}
