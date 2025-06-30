// src/database/entities/Job.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Employer } from "./Employer";
import { Category } from "./Category";
import { Skill } from "./Skill";
import { Location } from "./Location";
import { EmploymentType, ExperienceLevel } from "../../../constants/enum";
import { Application } from "./Application";

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "slug", unique: true })
  slug!: string;

  @Column({ name: "title" })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text", nullable: true })
  requirements?: string;

  @Column({ name: "salary_min", type: "decimal", nullable: true })
  salaryMin?: number;

  @Column({ name: "salary_max", type: "decimal", nullable: true })
  salaryMax?: number;

  @Column({
    name: "employment_type",
    type: "enum",
    enum: EmploymentType,
  })
  employmentType!: EmploymentType;

  @Column({
    name: "experience_level",
    type: "enum",
    enum: ExperienceLevel,
  })
  experienceLevel!: ExperienceLevel;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column({ name: "posted_at", type: "timestamp" })
  postedAt!: Date;

  @Column({ name: "expires_at", type: "timestamp", nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => Employer)
  @JoinColumn({ name: "employer_id" })
  employer!: Employer;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @ManyToMany(() => Skill, (skill) => skill.jobs)
  @JoinTable({
    name: "jobs_skills",
    joinColumn: { name: "job_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "skill_id", referencedColumnName: "id" },
  })
  skills!: Skill[];

  @ManyToMany(() => Location, (location) => location.jobs)
  @JoinTable({
    name: "jobs_locations",
    joinColumn: { name: "job_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "location_id", referencedColumnName: "id" },
  })
  locations!: Location[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Application, (application) => application.job)
  applications!: Application[];
}
