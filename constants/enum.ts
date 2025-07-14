export enum UserRole {
  STUDENT = 'student',
  EDUCATOR = 'educator',
  ADMIN = 'admin',
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