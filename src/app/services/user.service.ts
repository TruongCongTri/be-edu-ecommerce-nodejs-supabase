import { In } from "typeorm";
import { UserRole } from "../../../constants/enum";
import { AppError } from "../../../utils/errors/AppError";
import { Skill } from "../../database/entities/Skill";
import {
  skillRepository,
  SkillRepositoryType,
} from "../repositories/skill.repository";
import {
  userRepository,
  employerRepository,
  jobSeekerRepository,
  UserRepositoryType,
  EmployerRepositoryType,
  JobSeekerRepositoryType,
} from "../repositories/user.repository";
import { slugify } from "../../../utils/helpers/slugify";
import { AdminProfileOutputDto } from "../../database/dtos.output/AdminProfileOut.dto";
import { EmployerProfileOutputDto } from "../../database/dtos.output/EmployerProfileOutput.dto";
import { JobSeekerProfileOutputDto } from "../../database/dtos.output/JobSeekerProfileOutput.dto";
import { Employer } from "../../database/entities/Employer";
import { UpdateUserDto } from "../../database/dtos/UpdateUser.dto";
import { UpdateJobSeekerDto } from "../../database/dtos/UpdateJobSeeker.dto";
import { UpdateEmployerDto } from "../../database/dtos/UpdateEmployer.dto";
import { JobSeeker } from "../../database/entities/JobSeeker";
import { User } from "../../database/entities/User";

export class UserService {
  // private userRepo = userRepository;
  // private employerRepo = employerRepository;
  // private jobSeekerRepo = jobSeekerRepository;
  // private skillRepo = skillRepository;
  // constructor() {}
  private userRepo: UserRepositoryType;
  private employerRepo: EmployerRepositoryType;
  private jobSeekerRepo: JobSeekerRepositoryType;
  private skillRepo: SkillRepositoryType;

  constructor(
    userRepo: UserRepositoryType,
    employerRepo: EmployerRepositoryType,
    jobSeekerRepo: JobSeekerRepositoryType,
    skillRepo: SkillRepositoryType // Pass if needed, otherwise omit
  ) {
    this.userRepo = userRepo;
    this.employerRepo = employerRepo;
    this.jobSeekerRepo = jobSeekerRepo;
    this.skillRepo = skillRepo;
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
  private async getJobSeekerEntity(
    userId: string,
    relations?: string[]
  ): Promise<JobSeeker> {
    const jobSeeker = await this.jobSeekerRepo.findOne({
      where: { user: { id: userId } },
      relations: relations,
    });

    if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

    return jobSeeker;
  }
  /**
   * Fetches the Employer profile entity by user ID.
   * Does NOT throw if not found, as profile might need to be created.
   * @param userId The ID of the associated user.
   * @param relations Optional relations to load (e.g., ['user']).
   * @returns The Employer entity or null.
   */
  private async getEmployerEntity(
    userId: string,
    relations?: string[]
  ): Promise<Employer> {
    const employer = await this.employerRepo.findOne({
      where: { user: { id: userId } },
      relations: relations,
    });
    if (!employer) throw new AppError("Employer profile not found", 404);

    return employer;
  }

  // --- Public Methods (Exposed to Controllers) ---

  /**
   * Retrieves the profile of an authenticated user based on their role.
   * @param userId The ID of the authenticated user.
   * @returns The appropriate profile Output DTO (JobSeeker, Employer, or Admin).
   */
  getProfile = async (
    userId: string
  ): Promise<
    JobSeekerProfileOutputDto | EmployerProfileOutputDto | AdminProfileOutputDto
  > => {
    // 1. Fetch the base User entity using helper
    const user = await this.getUserEntity(userId);

    const baseProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    // 2. Fetch role-specific details and map to appropriate DTO
    switch (user.role) {
      case UserRole.JOB_SEEKER: {
        // Use helper to get the JobSeeker entity with necessary relations
        const jobSeeker = await this.getJobSeekerEntity(user.id, [
          "user",
          "skills",
        ]);

        // Use the static fromEntity method for clean mapping
        return JobSeekerProfileOutputDto.fromEntity(jobSeeker);
      }

      case UserRole.EMPLOYER: {
        // Use helper to get the Employer entity with necessary relations
        const employer = await this.getEmployerEntity(user.id, ["user"]);

        // Use the static fromEntity method for clean mapping
        return new EmployerProfileOutputDto(employer); // Should be fromEntity, but needs Employer as partial
      }

      case UserRole.ADMIN: {
        // Admin profile directly maps from the base User entity
        return AdminProfileOutputDto.fromEntity(user);
      }

      default:
        throw new AppError("Invalid user role", 400);
    }
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
    data: UpdateUserDto | UpdateJobSeekerDto | UpdateEmployerDto // you'll cast it correctly in controller
  ): Promise<
    JobSeekerProfileOutputDto | EmployerProfileOutputDto | AdminProfileOutputDto
  > => {
    // Fetch the base User entity first, as it's common to all roles
    const user = await this.getUserEntity(userId);

    // Apply updates to the base User entity fields if they exist in the incoming DTO
    // Use Object.assign for cleaner partial updates
    Object.assign(user, {
      fullName: (data as UpdateUserDto).fullName, // Cast to UpdateUserDto to access common fields
      phoneNumber: (data as UpdateUserDto).phoneNumber,
      address: (data as UpdateUserDto).address,
    });
    // Save the updated base user
    await this.userRepo.save(user);

    switch (role) {
      case UserRole.JOB_SEEKER: {
        const jobSeekerData = data as UpdateJobSeekerDto; // Type assertion for JobSeeker specific fields

        // Use helper to fetch job seeker profile
        let jobSeeker = await this.getJobSeekerEntity(userId, ["skills"]); // Load existing skills

        // If job seeker profile doesn't exist, create it. This handles cases where
        // a user might change their role or their profile wasn't fully set up.
        if (!jobSeeker) {
          jobSeeker = this.jobSeekerRepo.create({
            user: user, // Link to the existing User entity
          });
        }

        // Apply updates to job seeker specific fields
        Object.assign(jobSeeker, {
          resumeUrl: jobSeekerData.resumeUrl,
          experienceYears: jobSeekerData.experienceYears,
          desiredSalary: jobSeekerData.desiredSalary,
        });

        // Handle skills (Many-to-Many relationship)
        // If skillIds is provided in the DTO (even if empty), update the skills.
        // If skillIds is undefined, leave existing skills as they are.
        if (jobSeekerData.skillIds !== undefined) {
          if (jobSeekerData.skillIds.length > 0) {
            const skills = await this.skillRepo.findBy({
              id: In(jobSeekerData.skillIds),
            });
            // Validate if all provided skill IDs actually exist
            if (skills.length !== jobSeekerData.skillIds.length) {
              throw new AppError(
                "One or more provided skill IDs are invalid.",
                400
              );
            }
            jobSeeker.skills = skills; // Replace existing skills with new ones
          } else {
            jobSeeker.skills = []; // If an empty array is provided, clear all skills
          }
        }

        const savedJobSeeker = await this.jobSeekerRepo.save(jobSeeker);

        // Fetch the full updated JobSeeker profile with all necessary relations for the DTO
        const fullJobSeeker = await this.getJobSeekerEntity(savedJobSeeker.user.id, ["user", "skills"]); 

        return JobSeekerProfileOutputDto.fromEntity(fullJobSeeker);
      }

      case UserRole.EMPLOYER: {
        const employerData = data as UpdateEmployerDto; // Type assertion for Employer specific fields

        let employer = await this.employerRepo.findOne({
          where: { user: { id: userId } },
        });

        // If employer profile doesn't exist, create it.
        if (!employer) {
          // companyName is required for new employer profile creation
          if (!employerData.companyName) {
            throw new AppError(
              "Company name is required to create an employer profile.",
              400
            );
          }
          employer = this.employerRepo.create({
            user: user, // Link to the existing User entity
            companyName: employerData.companyName,
            slug: slugify(employerData.companyName), // Generate slug on creation
          });
        }

        // Apply updates to employer specific fields
        Object.assign(employer, {
          companyName: employerData.companyName,
          companyDescription: employerData.companyDescription,
          companyWebsite: employerData.companyWebsite,
          companyLogoUrl: employerData.companyLogoUrl,
        });

        // Update slug if companyName changed
        if (
          employerData.companyName &&
          employerData.companyName !== employer.companyName
        ) {
          employer.slug = slugify(employerData.companyName);
        }

        const savedEmployer = await this.employerRepo.save(employer);

        // Fetch the full updated Employer profile with all necessary relations for the DTO
        const fullEmployer = await this.getEmployerEntity(savedEmployer.user.id, ["user"]); // Use helper for final fetch
        
        return EmployerProfileOutputDto.fromEntity(fullEmployer);
      }

      case UserRole.ADMIN: {
        // For Admin, updates are typically only on the base User entity,
        // which has already been handled at the beginning of the method.
        // Fetch the user again to ensure latest data for output DTO if needed,
        // or just use the `user` object if it's guaranteed to be up-to-date.
        // Since we saved `user` at the start, it should be up-to-date.
        return AdminProfileOutputDto.fromEntity(user);
      }

      default:
        throw new AppError(
          "Invalid user role provided for profile update.",
          400
        );
    }
  };
}
