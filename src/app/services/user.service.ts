
import { UserRole } from "../../../constants/enum";
import { AppError } from "../../../utils/errors/AppError";

import {
  UserRepositoryType,
  StudentRepositoryType,
  EducatorRepositoryType,
} from "../repositories/user.repository";
import { slugify } from "../../../utils/helpers/slugify.helper";
import { EducatorDetail } from "../../database/entities/EducatorDetail";
import { StudentDetail } from "../../database/entities/StudentDetail";
import { User } from "../../database/entities/User";
import { UserDto } from "../../database/dtos/user.dto";
import { StudentDetailDto } from "../../database/dtos/student-detail.dto";
import { EducatorDetailDto } from "../../database/dtos/educator-detail.dto";
import { UpdateStudentDetailDto } from "../../database/dtos/update-student-detail.dto";
import { UpdateEducatorDetailDto } from "../../database/dtos/update-educator-detail.dto";

export class UserService {
  private userRepo: UserRepositoryType;
  private educatorRepo: EducatorRepositoryType;
  private studentRepo: StudentRepositoryType;

  constructor(
    userRepo: UserRepositoryType,
    educatorRepo: EducatorRepositoryType,
    studentRepo: StudentRepositoryType
  ) {
    this.userRepo = userRepo;
    this.educatorRepo = educatorRepo;
    this.studentRepo = studentRepo;
  }

  /**
   * Fetches the base User entity by ID. Throws AppError if not found.
   * @param userId The ID of the user.
   * @returns The User entity.
   */
  private async getUserEntity(userId: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
  /**
   * Fetches the JobSeeker profile entity by user ID.
   * Does NOT throw if not found, as profile might need to be created.
   * @param userId The ID of the associated user.
   * @param relations Optional relations to load (e.g., ['skills', 'user']).
   * @returns The JobSeeker entity or null.
   */
  private async getStudentEntity(
    userId: string,
    relations?: string[]
  ): Promise<StudentDetail | null> {
    const student = await this.studentRepo.findOne({
      where: { user: { id: userId } },
      relations: relations,
    });

    return student;
  }
  /**
   * Fetches the Employer profile entity by user ID.
   * Does NOT throw if not found, as profile might need to be created.
   * @param userId The ID of the associated user.
   * @param relations Optional relations to load (e.g., ['user']).
   * @returns The Employer entity or null.
   */
  private async getEducatorEntity(
    userId: string,
    relations?: string[]
  ): Promise<EducatorDetail | null> {
    const employer = await this.educatorRepo.findOne({
      where: { user: { id: userId } },
      relations: relations,
    });
    return employer;
  }

  // --- Public Methods (Exposed to Controllers) ---

  /**
   * Retrieves the profile of an authenticated user.
   * @param userId The ID of the authenticated user.
   * @returns The user profile Output DTO
   */
  getProfile = async (userId: string): Promise<UserDto> => {
    // 1. Fetch the base User entity using helper
    const user = await this.getUserEntity(userId);
    return UserDto.fromEntity(user);
  };

  /**
   * Retrieves the profile of an authenticated user based on their role.
   * @param userId The ID of the authenticated user.
   * @returns The Student profile Output DTO
   */
  getStudentDetail = async (userId: string): Promise<StudentDetailDto> => {
    // 1. Fetch the base Student entity using helper
    const student = await this.getStudentEntity(userId);

    if (!student) throw new AppError("Student profile not found", 404);

    return StudentDetailDto.fromEntity(student);
  };

  /**
   * Retrieves the profile of an authenticated user based on their role.
   * @param userId The ID of the authenticated user.
   * @returns The Educator profile Output DTO
   */
  getEducatorDetail = async (userId: string): Promise<EducatorDetailDto> => {
    // 1. Fetch the base Educator entity using helper
    const educator = await this.getEducatorEntity(userId);

    if (!educator) throw new AppError("Educator profile not found", 404);

    return EducatorDetailDto.fromEntity(educator);
  };

  /**
   * Updates the profile of an authenticated user based on their role.
   * @param userId The ID of the authenticated user.
   * @param role The role of the authenticated user.
   * @param data The DTO containing the update data (type depends on role).
   * @returns The updated profile DTO.
   */
  updateProfile = async (
    userId: string,
    role: UserRole,
    data: UpdateStudentDetailDto | UpdateEducatorDetailDto // you'll cast it correctly in controller
  ): Promise<StudentDetailDto | EducatorDetailDto> => {
    // Always load the User entity first, ensure it exists
    const user = await this.getUserEntity(userId);

    switch (role) {
      case UserRole.STUDENT: {
        const studentData = data as UpdateStudentDetailDto; // Type assertion for student specific fields

        // Use helper to fetch student profile
        let studentDetail = await this.getStudentEntity(userId, ["user"]);

        // If student profile doesn't exist, create it. This handles cases where
        // a user might change their role or their profile wasn't fully set up.
        if (!studentDetail) {
          studentDetail = this.studentRepo.create({
            user: user, // Link to the existing User entity
          });
        }

        // Apply updates to student specific fields
        Object.assign(studentDetail, {
          bio: studentDetail.bio || studentData.bio,
        });

        await this.studentRepo.save(studentDetail);

        const fullStudent = await this.getStudentEntity(user.id, ["user"]);

        if (!fullStudent) throw new AppError("Student profile not found", 404);

        return StudentDetailDto.fromEntity(fullStudent);
      }

      case UserRole.EDUCATOR: {
        const educatorData = data as UpdateEducatorDetailDto; // Type assertion for Educator specific fields

        // Use helper to fetch educator profile
        let educatorDetail = await this.getEducatorEntity(userId, ["user"]);

        // If educator profile doesn't exist, create it.
        if (!educatorDetail) {
          educatorDetail = this.educatorRepo.create({
            user: user, // Link to the existing User entity
          });
        }

        // Apply updates to employer specific fields
        Object.assign(educatorDetail, {
          bio: educatorData.bio ?? educatorDetail.bio,
          expertise: educatorData.expertise ?? educatorDetail.expertise,
        });

        await this.educatorRepo.save(educatorDetail);

        const fullEducator = await this.getEducatorEntity(user.id, ["user"]);

        if (!fullEducator)
          throw new AppError("Educator profile not found", 404);

        return EducatorDetailDto.fromEntity(fullEducator);
      }

      default:
        throw new AppError("Invalid role for profile update", 400);
    }
  };
}
