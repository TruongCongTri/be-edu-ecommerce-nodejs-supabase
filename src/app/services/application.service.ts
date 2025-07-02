import { FindOptionsWhere } from "typeorm";
import { AppError } from "../../../utils/errors/AppError";
import { ApplicationOutputDto } from "../../database/dtos.output/ApplicationOutput.dto";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { CreateApplicationDto } from "../../database/dtos/CreateApplication.dto";
import { UpdateApplicationStatusDto } from "../../database/dtos/UpdateApplicationStatus.dto";
import {
  Application,
  ApplicationStatus,
} from "../../database/entities/Application";
import { ApplicationRepositoryType } from "../repositories/application.repository";
import { CategoryRepositoryType } from "../repositories/category.repository";
import {
  jobRepository,
  JobRepositoryType,
} from "../repositories/job.repository";
import { LocationRepositoryType } from "../repositories/location.repository";
import { SkillRepositoryType } from "../repositories/skill.repository";
import {
  EmployerRepositoryType,
  JobSeekerRepositoryType,
} from "../repositories/user.repository";
import { buildQueryOptions } from "../../../utils/buildQueryOptions";
import { getProfileByUserId } from "../../../utils/helpers/profileHelper";
import { createPaginationMeta } from "../../../utils/helpers/paginationHelper";
import { PaginationMetaDto } from "../../database/dtos.output/PaginationMeta.dto";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";

export class ApplicationService {
  // private appRepo = applicationRepository;
  // private jobRepo = jobRepository;
  // private jobSeekerRepo = jobSeekerRepository;
  // private employerRepo = employerRepository;

  private appRepo: ApplicationRepositoryType;
  private jobRepo: JobRepositoryType;
  private jobSeekerRepo: JobSeekerRepositoryType;
  private employerRepo: EmployerRepositoryType; // Included as it was in original snippet, but not used in this method
  private skillRepo: SkillRepositoryType;
  private categoryRepo: CategoryRepositoryType;
  private locationRepo: LocationRepositoryType;

  constructor(
    appRepo: ApplicationRepositoryType,
    jobRepo: JobRepositoryType,
    jobSeekerRepo: JobSeekerRepositoryType,
    employerRepo: EmployerRepositoryType, // Inject if it will be used in other methods of this service
    skillRepo: SkillRepositoryType,
    categoryRepo: CategoryRepositoryType,
    locationRepo: LocationRepositoryType
  ) {
    this.appRepo = appRepo;
    this.jobRepo = jobRepo;
    this.jobSeekerRepo = jobSeekerRepo;
    this.employerRepo = employerRepo;
    this.skillRepo = skillRepo;
    this.categoryRepo = categoryRepo;
    this.locationRepo = locationRepo;
  }

  // job seeker specific methods
  /**
   * Handles the creation of a new job application by a job seeker.
   * @param userId The ID of the authenticated job seeker.
   * @param dto The data for the application (jobId, coverLetter).
   * @returns An ApplicationOutputDto representing the created application.
   */
  createApplication = async (
    userId: string,
    dto: CreateApplicationDto
  ): Promise<ApplicationOutputDto> => {
    // 1. Verify the existence of the Job
    const job = await this.jobRepo.findOneBy({ id: dto.jobId });
    if (!job) throw new AppError("Job not found", 404);

    // 2. Verify and fetch the Job Seeker profile
    // Ensure 'user' relation is loaded as it might be needed for the JobSeeker entity itself
    const jobSeeker = await this.jobSeekerRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });
    if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

    // 3. Prevent duplicate applications for the same job by the same job seeker
    const existingApp = await this.appRepo.findOne({
      where: {
        job: { id: dto.jobId },
        jobSeeker: { id: jobSeeker.id },
      },
    });
    if (existingApp)
      throw new AppError("You already applied for this job", 400);

    // 4. Create the new Application entity
    const application = this.appRepo.create({
      job, // Link to the Job entity
      jobSeeker, // Link to the JobSeeker entity
      coverLetter: dto.coverLetter,
      appliedAt: new Date(), // Set application timestamp
      // Assuming initial status is PENDING or similar, might need to set it here if not default in entity
      // status: ApplicationStatus.PENDING,
    });

    // 5. Save the application to the database
    const savedApplication = await this.appRepo.save(application);

    // 6. Return the created application mapped to the output DTO
    // Ensure all necessary relations (job, jobSeeker, etc.) are loaded for fromEntity
    const fullApplication = await this.appRepo.findOneOrFail({
      where: { id: savedApplication.id },
      relations: ["job", "jobSeeker", "jobSeeker.user"], // Load necessary relations for the output DTO
    });

    // 7. Return the created application mapped to the output DTO
    return ApplicationOutputDto.fromEntity(fullApplication);
  };

  /**
   * Retrieves all job applications submitted by a specific job seeker, with pagination and search.
   * @param userId The ID of the authenticated job seeker.
   * @param queryParams BaseQueryParamsDto containing page, per_page, and search.
   * @returns An array of ApplicationOutputDto.
   */
  getApplicationsForJobSeeker = async (
    userId: string,
    queryParams: BaseQueryParamsDto
  ): Promise<{
    applications: ApplicationOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Fetch User - Job Seeker Profile and Handle Not Found ---
    // const jobSeeker = await this.jobSeekerRepo.findOne({
    //   where: { user: { id: userId } },
    // });
    // if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);
    //Use the helper for profile fetching
    const jobSeeker = await getProfileByUserId(
      this.jobSeekerRepo,
      userId,
      "Job seeker"
    );

    // --- BLOCK 2: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 3: Build Find Options ---
    const findOptions = buildQueryOptions<Application>({
      queryParams,
      // Mandatory filter: only applications belonging to this job seeker
      initialWhere: { jobSeeker: { id: jobSeeker.id } },
      // Fields to search within if 'search' query param is provided
      searchFields: ["job.title", "job.description"],
      // Default order for the results
      defaultOrder: { appliedAt: "DESC" },
    });

    // --- BLOCK 4: Execute Database Query (findAndCount) ---
    const [applications, total] = await this.appRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        // Relations still need to be explicitly listed
        job: {
          employer: true,
          category: true,
          skills: true,
          locations: true,
        },
        jobSeeker: {
          user: true,
          skills: true,
        },
      },
    });

    // --- BLOCK 5: Map Entities to DTOs ---
    const applicationDtos = applications.map(ApplicationOutputDto.fromEntity);

    // --- BLOCK 6: Calculate and Create Pagination Metadata ---
    // const total_page = Math.ceil(total / per_page!); // Use non-null assertion for per_page
    // const paginationMeta = new PaginationMetaDto(
    //   page!, // Use non-null assertion for page
    //   per_page!, // Use non-null assertion for per_page
    //   total,
    //   total_page
    // );
    //Use the helper for pagination metadata
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 7: Return Data and Pagination Metadata ---
    return {
      applications: applicationDtos,
      pagination: paginationMeta,
    };
  };

  /**
   * Retrieves the detailed information of a specific application for an authenticated job seeker.
   * Ensures the application belongs to the requesting job seeker for authorization.
   * @param userId The ID of the authenticated job seeker.
   * @param applicationId The ID of the application to retrieve.
   * @returns An ApplicationOutputDto for the specific application.
   */
  getApplicationDetailForJobSeeker = async (
    userId: string,
    applicationId: string
  ): Promise<ApplicationOutputDto> => {
    // 1. Fetch the application by its ID, eagerly loading all required relations
    const application = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: [
        "job",
        "job.category",
        "job.locations",
        "job.skills",
        "job.employer",
        "jobSeeker",
        "jobSeeker.skills",
        "jobSeeker.user",
      ],
    });

    // 2. Check if the application was found
    if (!application) throw new AppError("Application not found", 404);

    // 3. Authorization Check: Ensure the application belongs to the authenticated job seeker
    if (application.jobSeeker.user.id !== userId)
      throw new AppError(
        "You are not authorized to view this application's detail",
        403
      );

    // 4. Map the fetched entity to the output DTO
    return ApplicationOutputDto.fromEntity(application);
  };

  // Employer specific methods
  /**
   * Retrieves all job applications for all jobs posted by the authenticated employer,
   * with pagination and search functionality.
   * @param userId The ID of the authenticated user (employer).
   * @param queryParams BaseQueryParamsDto containing page, per_page, and search.
   * @returns An object containing an array of ApplicationOutputDto and pagination metadata.
   */
  getApplicationsForEmployer = async (
    userId: string,
    queryParams: BaseQueryParamsDto
  ): Promise<{
    applications: ApplicationOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Fetch User - Employer Profile and Handle Not Found ---
    // const employer = await this.employerRepo.findOne({
    //   where: { user: { id: userId } },
    // });
    // if (!employer) throw new AppError("Employer profile not found", 404);
    const employer = await getProfileByUserId(
      this.employerRepo,
      userId,
      "Employer"
    );

    // --- BLOCK 2: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 3: Build Find Options ---
    const findOptions = buildQueryOptions<Application>({
      queryParams,
      // Initial where clause: applications must belong to jobs owned by this employer
      initialWhere: {
        job: { employer: { id: employer.id } },
      } as FindOptionsWhere<Application>,
      // Search fields: search by job title, job description, or job seeker name
      searchFields: [
        "job.title",
        "job.description",
        "jobSeeker.user.fullName", // Assuming fullName is on the User entity
      ],
      defaultOrder: { appliedAt: "DESC" },
    });

    // --- BLOCK 4: Execute Database Query (findAndCount) ---
    const [applications, total] = await this.appRepo.findAndCount({
      ...findOptions, // Apply pagination, order, and dynamic search where clause
      relations: {
        job: {
          category: true,
          employer: true,
          skills: true,
          locations: true,
        },
        jobSeeker: {
          user: true, // Crucial for searching by fullName
          skills: true,
        },
      },
    });

    // --- BLOCK 5: Map Entities to DTOs ---
    const applicationDtos = applications.map(ApplicationOutputDto.fromEntity);

    // --- BLOCK 6: Calculate and Create Pagination Metadata ---
    // const total_page = Math.ceil(total / per_page!); // Use non-null assertion for per_page
    // const paginationMeta = new PaginationMetaDto(
    //   page!, // Use non-null assertion for page
    //   per_page!, // Use non-null assertion for per_page
    //   total,
    //   total_page
    // );
    //Use the helper for pagination metadata
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 7: Return Data and Pagination Metadata ---
    return {
      applications: applicationDtos,
      pagination: paginationMeta,
    };
  };
  /**
   * Retrieves all job applications for a specific job owned by the authenticated employer,
   * with pagination and search functionality for job seeker names.
   * @param userId The ID of the authenticated employer's user account.
   * @param jobId The ID of the job for which to retrieve applications.
   * @param queryParams BaseQueryParamsDto containing page, per_page, and search.
   * @returns An object containing an array of ApplicationOutputDto and pagination metadata.
   */
  getApplicationsForJobForEmployer = async (
    userId: string,
    jobId: string,
    queryParams: BaseQueryParamsDto
  ): Promise<{
    applications: ApplicationOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Fetch User - Employer Profile and Handle Not Found ---
    // const employer = await this.employerRepo.findOne({
    //   where: { user: { id: userId } },
    // });
    // if (!employer) throw new AppError("Employer profile not found", 404);
    const employer = await getProfileByUserId(
      this.employerRepo,
      userId,
      "Employer"
    );

    // --- BLOCK 2: Fetch Job - ensure it exists and belongs to this employer ---
    // This is crucial for authorization and data integrity.
    const job = await this.jobRepo.findOne({
      where: {
        id: jobId,
        employer: { id: employer.id }, // Ensure the job belongs to this employer
      },
    });
    if (!job) throw new AppError("Job not found or not owned by you", 404);

    // --- BLOCK 3: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 4: Build Find Options ---
    const findOptions = buildQueryOptions<Application>({
      queryParams,
      // Initial where clause: applications must belong to this specific job
      initialWhere: { job: { id: jobId } } as FindOptionsWhere<Application>,
      // Search fields: Job Seeker's first and last name
      searchFields: ["jobSeeker.user.firstName", "jobSeeker.user.lastName"],
      defaultOrder: { appliedAt: "DESC" },
    });

    // --- BLOCK 5: Execute Database Query (findAndCount) ---
    const [applications, total] = await this.appRepo.findAndCount({
      ...findOptions, // Apply pagination, order, and dynamic search where clause
      relations: {
        job: {
          category: true,
          employer: {
            user: true, // Crucial: Load user of employer to check userId
          },
          skills: true,
          locations: true,
        },
        jobSeeker: {
          user: true, // Crucial for searching by name
          skills: true,
        },
      },
    });

    // --- BLOCK 6: Map Entities to DTOs ---
    const applicationDtos = applications.map(ApplicationOutputDto.fromEntity);

    // --- BLOCK 7: Calculate and Create Pagination Metadata ---
    // const total_page = Math.ceil(total / per_page!);
    // const paginationMeta = new PaginationMetaDto(
    //   page!,
    //   per_page!,
    //   total,
    //   total_page
    // );
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 8: Return Data and Pagination Metadata ---
    return {
      applications: applicationDtos,
      pagination: paginationMeta,
    };
  };
  getApplicationDetailForEmployer = async (
    userId: string,
    applicationId: string
  ): Promise<ApplicationOutputDto> => {
    // 1. Fetch the application by its ID, eagerly loading ALL required relations
    // for the ApplicationOutputDto and its nested DTOs.
    const application = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: {
        job: {
          employer: {
            user: true, // Crucial: Load user of employer to check userId
          },
          category: true, // Needed for JobPartialOutputDto
          locations: true, // Needed for JobPartialOutputDto
          skills: true, // Needed for JobPartialOutputDto
        },
        jobSeeker: {
          user: true, // Needed for JobSeekerProfileOutputDto
          skills: true, // Needed for JobSeekerProfileOutputDto
        },
      },
    });

    // 2. Check if the application was found
    if (!application) throw new AppError("Application not found", 404);

    // 3. Authorization Check: Ensure the application's job is owned by the authenticated employer.
    // Access application.job.employer.user.id to get the user ID associated with the employer.
    if (application.job.employer.userId !== userId) {
      throw new AppError(
        "You are not authorized to view this application's detail",
        403
      );
    }

    // 4. Map the fetched entity to the output DTO
    return ApplicationOutputDto.fromEntity(application);
  };

  updateApplicationStatus = async (
    userId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto
  ): Promise<ApplicationOutputDto> => {
    // 1. Fetch the application by its ID, eagerly loading all required relations
    // for the authorization check and for the final ApplicationOutputDto mapping.
    const application = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: {
        job: {
          employer: {
            user: true, // Crucial: Load user of employer to check userId
          },
          category: true, // Needed for JobPartialOutputDto
          locations: true, // Needed for JobPartialOutputDto
          skills: true, // Needed for JobPartialOutputDto
        },
        jobSeeker: {
          user: true, // Needed for JobSeekerProfileOutputDto
          skills: true, // Needed for JobSeekerProfileOutputDto
        },
      },
    });

    // 2. Check if the application was found
    if (!application) throw new AppError("Application not found", 404);

    // 3. Authorization Check: Ensure the application's job is owned by the authenticated employer.
    // Corrected check: access application.job.employer.user.id
    if (application.job.employer.user.id !== userId) {
      throw new AppError(
        "You are not authorized to update this application",
        403 // 403 Forbidden
      );
    }

    // 4. Enforce valid status transitions
    const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.PENDING]: [ApplicationStatus.REVIEWED],
      [ApplicationStatus.REVIEWED]: [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.ACCEPTED]: [ApplicationStatus.INTERVIEW], // Only from ACCEPTED to INTERVIEW
      [ApplicationStatus.REJECTED]: [], // Cannot transition from REJECTED
      [ApplicationStatus.INTERVIEW]: [], // Cannot transition from INTERVIEW
    };

    const currentStatus = application.status;
    const newStatus = dto.status;

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
        400
      );
    }

    // 5. Update the application status
    application.status = dto.status;
    // 6. Save the updated application to the database
    await this.appRepo.save(application);

    // 7. Return the updated application mapped to the output DTO
    return ApplicationOutputDto.fromEntity(application);
  };
}
