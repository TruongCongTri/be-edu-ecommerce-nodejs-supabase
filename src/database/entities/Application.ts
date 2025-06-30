// src/database/entities/Application.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import { Job } from "./Job";
import { JobSeeker } from "./JobSeeker";

export enum ApplicationStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  INTERVIEW = "interview",
}

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "cover_letter", type: "text", nullable: true })
  coverLetter?: string;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status!: ApplicationStatus;

  @Column({ name: "applied_at", type: "timestamp" })
  appliedAt!: Date;

  @ManyToOne(() => Job)
  @JoinColumn({ name: "job_id" })
  job!: Job;

  // @ManyToOne(() => JobSeeker)
  // @JoinColumn({ name: "job_seeker_id" })
  @ManyToOne(() => JobSeeker, (jobSeeker) => jobSeeker.applications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "job_seeker_id" })
  jobSeeker!: JobSeeker;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @BeforeInsert()
  setAppliedAt() {
    this.appliedAt = new Date();
  }
}
