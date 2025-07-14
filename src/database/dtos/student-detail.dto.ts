import { Expose } from "class-transformer";
import { StudentDetail } from "../entities/StudentDetail";

export class StudentDetailDto {
  @Expose()
  id!: string;

  @Expose()
  userId!: string;

  @Expose()
  bio?: string;

  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<StudentDetailDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(student: StudentDetail): StudentDetailDto {
    return new StudentDetailDto({
      id: student.id,
      userId: student.user.id,
      bio: student.bio || "",
    });
  }
}
