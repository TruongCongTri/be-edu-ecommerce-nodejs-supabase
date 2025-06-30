export enum UserRole {
  JOB_SEEKER = "job_seeker",
  EMPLOYER = "employer",
  ADMIN = "admin",
}

export enum EmploymentType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
  CONTRACT = "contract",
  INTERNSHIP = "internship",
  FREELANCE = "freelance",
}

export enum ExperienceLevel {
  FRESHER = "fresher",
  JUNIOR = "junior",
  MID = "mid",
  SENIOR = "senior",
}

export enum Status {
  PENDING = "pending",
  REVIEWED = "reviewed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  INTERVIEW = "interview",
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 5;

export const FORBIDDEN_WORDS = ['badword1', 'forbiddenterm', 'spammy'];