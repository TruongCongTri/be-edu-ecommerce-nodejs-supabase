import {
  jobRepository,
  JobRepositoryType,
} from "../repositories/job.repository";

import { CreateJobDto } from "../../database/dtos/CreateJob.dto";
import { UpdateJobDto } from "../../database/dtos/UpdateJob.dto";

import { slugify } from "../../../utils/helpers/slugify";
import { AppError } from "../../../utils/errors/AppError";
import {
  categoryRepository,
  CategoryRepositoryType,
} from "../repositories/category.repository";
import {
  skillRepository,
  SkillRepositoryType,
} from "../repositories/skill.repository";
import {
  employerRepository,
  EmployerRepositoryType,
  userRepository,
} from "../repositories/user.repository";
import {
  locationRepository,
  LocationRepositoryType,
} from "../repositories/location.repository";
import {
  Between,
  Brackets,
  EntityNotFoundError,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { JobFilterParams } from "../../database/dtos/JobFilterParams.dto";

import { Job } from "../../database/entities/Job";
import { Category } from "../../database/entities/Category";
import { Skill } from "../../database/entities/Skill";
import { Location } from "../../database/entities/Location";
import { Employer } from "../../database/entities/Employer";
import { JobPartialOutputDto } from "../../database/dtos.output/JobPartialOutput.dto";
import { JobOutputDto } from "../../database/dtos.output/JobOutput.dto";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";

interface JobFilterResult {
  data: {
    jobs: Job[];
  };
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_page: number;
  };
}

export class JobService {
  // private jobRepo = jobRepository;
  // private cateRepo = categoryRepository;
  // private skillRepo = skillRepository;
  // private locationRepo = locationRepository;
  // private employerRepo = employerRepository;
  // constructor() {}
  // Declare properties to hold the injected repositories
  private jobRepo: JobRepositoryType;
  private cateRepo: CategoryRepositoryType;
  private skillRepo: SkillRepositoryType;
  private locationRepo: LocationRepositoryType;
  private employerRepo: EmployerRepositoryType;

  // Constructor now accepts repositories as arguments
  // This is where DI happens!
  constructor(
    jobRepo: JobRepositoryType,
    cateRepo: CategoryRepositoryType,
    skillRepo: SkillRepositoryType,
    locationRepo: LocationRepositoryType,
    employerRepo: EmployerRepositoryType
  ) {
    this.jobRepo = jobRepo;
    this.cateRepo = cateRepo;
    this.skillRepo = skillRepo;
    this.locationRepo = locationRepo;
    this.employerRepo = employerRepo;
  }

  // --- Private Helper Methods (Internal Entity Fetching & Validation) ---

  /**
   * Fetches a Job entity by slug, optionally with specified relations.
   * Throws AppError if the job is not found.
   */
  private async getJobEntityBySlug(
    slug: string,
    relations: string[] = []
  ): Promise<Job> {
    const job = await this.jobRepo.findOneOrFail({
      where: { slug },
      relations,
    });
    if (!job) {
      throw new AppError(`Job with Slug '${slug}' not found.`, 404);
    }

    return job;
  }

  /**
   * Fetches a Category entity by ID. Throws AppError if not found.
   */
  private async getCategoryEntity(categoryId: string): Promise<Category> {
    const category = await this.cateRepo.findOneBy({ id: categoryId });
    if (!category) {
      throw new AppError(`Category with ID '${categoryId}' not found.`, 404);
    }
    return category;
  }

  /**
   * Fetches Skill entities by IDs. Throws AppError if any ID is invalid.
   */
  private async getSkillEntities(skillIds: string[]): Promise<Skill[]> {
    if (!skillIds || skillIds.length === 0) {
      return [];
    }
    const skills = await this.skillRepo.findBy({ id: In(skillIds) });
    if (skills.length !== skillIds.length) {
      throw new AppError("One or more provided skill IDs are invalid.", 400);
    }
    return skills;
  }

  /**
   * Fetches Location entities by IDs. Throws AppError if any ID is invalid.
   */
  private async getLocationEntities(
    locationIds: string[]
  ): Promise<Location[]> {
    if (!locationIds || locationIds.length === 0) {
      return [];
    }
    const locations = await this.locationRepo.findBy({ id: In(locationIds) });
    if (locations.length !== locationIds.length) {
      throw new AppError("One or more provided location IDs are invalid.", 400);
    }
    return locations;
  }

  private async getEmployerEntityByUserId(userId: string): Promise<Employer> {
    // ... (implementation as before) ...
    const employer = await this.employerRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });
    if (!employer) {
      throw new AppError(
        "Only registered employers can post or manage jobs.",
        403
      );
    }
    return employer;
  }

  // --- Public Methods (Return DTOs, use private helpers) ---

  // Filtration logic for jobs
  getAllFilteredJobs = async (
    filter: JobFilterParams
  ): Promise<JobFilterResult> => {
    const {
      page = DEFAULT_PAGE,
      per_page = DEFAULT_PER_PAGE,
      search,
      categoryId,
      skillIds,
      locationIds,
      salaryMin,
      salaryMax,
    } = filter;

    const skip = (page - 1) * per_page;
    // Helper function to apply filters to a QueryBuilder
    const applyFilters = (queryBuilder: SelectQueryBuilder<Job>) => {
      queryBuilder.andWhere("job.isActive = :isActive", { isActive: true });

      if (search) {
        // Use Brackets for proper SQL grouping of OR conditions
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where("job.title ILIKE :search", {
              search: `%${search}%`,
            }).orWhere("job.description ILIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }

      if (categoryId) {
        // Since category is a ManyToOne, `category.id` or `job.categoryId` could be used.
        // If `category` relation is eagerly loaded, `category.id` is fine.
        // If not, `job.categoryId` would be the direct column. Your entity has a `category_id` JoinColumn.
        // Let's use the relation for clarity:
        queryBuilder.andWhere("category.id = :categoryId", { categoryId });
      }

      if (salaryMin !== undefined) {
        queryBuilder.andWhere("job.salaryMin >= :salaryMin", { salaryMin });
      }

      if (salaryMax !== undefined) {
        queryBuilder.andWhere("job.salaryMax <= :salaryMax", { salaryMax });
      }

      // --- Many-to-Many Filtering with Inner Joins on Junction Tables ---
      // The Job entity confirms `jobs_skills` and `jobs_locations` as junction tables.
      // Using `innerJoin` with these tables is the correct and efficient way to filter.
      if (skillIds?.length) {
        queryBuilder
          .innerJoin("job.jobsSkills", "js") // "js" is alias for the junction table
          .andWhere("js.skillId IN (:...skillIds)", { skillIds });
      }
      if (locationIds?.length) {
        queryBuilder
          .innerJoin("job.jobsLocations", "jl") // "jl" is alias for the junction table
          .andWhere("jl.locationId IN (:...locationIds)", { locationIds });
      }
      return queryBuilder;
    };

    // 1. Build the count query (to get total number of matching jobs)
    const countQb = this.jobRepo.createQueryBuilder("job");
    applyFilters(countQb); // Apply all filters
    // Use select and getRawOne for counting distinct jobs, crucial for M2M filters
    const countResult = await countQb
      .leftJoin("job.category", "category") // Join category for filtering if needed
      .select("COUNT(DISTINCT job.id)", "count") // Count distinct jobs
      .getRawOne();
    const total = parseInt(countResult.count, 10);

    // 2. Build the data query (to get the actual jobs for the current page)
    const dataQb = this.jobRepo
      .createQueryBuilder("job")
      // Eagerly load all necessary relations for the final output
      .leftJoinAndSelect("job.category", "category")
      .leftJoinAndSelect("job.employer", "employer")
      .leftJoinAndSelect("job.skills", "skill")
      .leftJoinAndSelect("job.locations", "location");

    applyFilters(dataQb); // Apply all filters again

    // Apply ordering and pagination
    const jobs = await dataQb
      .orderBy("job.createdAt", "DESC") // Order by job creation date
      .skip(skip)
      .take(per_page)
      .getMany(); // Use getMany() since count is separate

    return {
      data: { jobs },
      pagination: {
        current_page: page,
        per_page,
        total,
        total_page: Math.ceil(total / per_page),
      },
    };
  };
  getAllEmployerFilteredJobs = async (
    employerId: string, // The ID of the authenticated employer
    filter: JobFilterParams // The filter parameters from the query
  ): Promise<JobFilterResult> => {
    // Return type now matches JobFilterResult
    const {
      page = DEFAULT_PAGE,
      per_page = DEFAULT_PER_PAGE,
      search,
      categoryId,
      skillIds,
      locationIds,
      salaryMin,
      salaryMax,
    } = filter;

    const skip = (page - 1) * per_page;

    // Helper function to apply all common filters to a QueryBuilder
    const applyCommonFilters = (queryBuilder: SelectQueryBuilder<Job>) => {
      queryBuilder.andWhere("job.isActive = :isActive", { isActive: true });

      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where("job.title ILIKE :search", {
              search: `%${search}%`,
            }).orWhere("job.description ILIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }

      if (categoryId) {
        queryBuilder.andWhere("category.id = :categoryId", { categoryId });
      }

      if (salaryMin !== undefined) {
        queryBuilder.andWhere("job.salaryMin >= :salaryMin", { salaryMin });
      }

      if (salaryMax !== undefined) {
        queryBuilder.andWhere("job.salaryMax <= :salaryMax", { salaryMax });
      }

      if (skillIds?.length) {
        queryBuilder
          .innerJoin("job.jobsSkills", "js", "js.jobId = job.id")
          .andWhere("js.skillId IN (:...skillIds)", { skillIds });
      }
      if (locationIds?.length) {
        queryBuilder
          .innerJoin("job.jobsLocations", "jl", "jl.jobId = job.id")
          .andWhere("jl.locationId IN (:...locationIds)", { locationIds });
      }
      return queryBuilder;
    };

    // --- Build the Count Query ---
    const countQb = this.jobRepo.createQueryBuilder("job");
    applyCommonFilters(countQb); // Apply common filters
    // Add the specific filter for employerId
    countQb
      .leftJoin("job.employer", "employer") // Join employer to filter by its ID
      .andWhere("employer.id = :employerId", { employerId });

    // Get total count of jobs for this employer
    const countResult = await countQb
      .select("COUNT(DISTINCT job.id)", "count")
      .getRawOne();
    const total = parseInt(countResult.count, 10);

    // --- Build the Data Query ---
    const dataQb = this.jobRepo
      .createQueryBuilder("job")
      // Eagerly load all necessary relations for the final output
      .leftJoinAndSelect("job.category", "category")
      .leftJoinAndSelect("job.employer", "employer")
      .leftJoinAndSelect("job.skills", "skill")
      .leftJoinAndSelect("job.locations", "location");

    applyCommonFilters(dataQb); // Apply common filters
    // Add the specific filter for employerId to the data query
    dataQb.andWhere("employer.id = :employerId", { employerId });

    // Apply ordering and pagination
    const jobs = await dataQb
      .orderBy("job.createdAt", "DESC") // Order by job creation date
      .skip(skip)
      .take(per_page)
      .getMany(); // Use getMany() since count is separate

    return {
      data: { jobs },
      pagination: {
        current_page: page,
        per_page,
        total,
        total_page: Math.ceil(total / per_page),
      },
    };
  };

  /**
   * Retrieves a list of all jobs with partial details.
   * @returns A promise resolving to an array of `JobPartialOutputDto`.
   */
  getAllJobs = async (): Promise<JobPartialOutputDto[]> => {
    // Fetch entities without relations for partial view
    const jobs = await this.jobRepo.find({
      order: { createdAt: "DESC" },
    });

    const jobDtos = jobs.map(JobPartialOutputDto.fromEntity);

    return jobDtos;
  };
  getAllJobDetails = async (): Promise<JobOutputDto[]> => {
    // Fetch entities with all necessary relations for full details
    const jobs = await this.jobRepo.find({
      relations: ["employer", "category", "skills", "locations"],
      order: { createdAt: "DESC" },
    });

    const jobDtos = jobs.map(JobOutputDto.fromEntity);

    return jobDtos;
  };

  /**
   * Retrieves the full details of a single job by its slug.
   * This method replaces the previous 'getJobBySlug' and 'getJobDetailBySlug'
   * to consistently return a detailed DTO.
   * @param slug The slug of the job to retrieve.
   * @returns A promise resolving to a `JobOutputDto`.
   */
  getJobBySlug = async (slug: string): Promise<JobPartialOutputDto> => {
    // Use private helper to fetch the job entity with all relations
    const job = await this.getJobEntityBySlug(slug);

    const jobDto = JobPartialOutputDto.fromEntity(job);

    return jobDto;
  };
  /**
   * Updates an existing job posting.
   * @param slug The slug of the job to update.
   * @param dto The data for updating the job.
   * @param employerId The ID of the authenticated employer.
   * @returns A promise resolving to the updated `JobOutputDto`.
   */
  getJobDetailBySlug = async (slug: string): Promise<JobOutputDto> => {
    // Use private helper to fetch the job entity with all relations
    const job = await this.getJobEntityBySlug(slug, [
      "employer",
      "category",
      "skills",
      "locations",
    ]);

    const jobDto = JobOutputDto.fromEntity(job);

    return jobDto;
  };

  createJob = async (
    dto: CreateJobDto,
    userId: string
  ): Promise<JobOutputDto> => {
    // 1. Fetch related entities using private helpers
    const category = await this.getCategoryEntity(dto.categoryId);
    const skills = await this.getSkillEntities(dto.skillIds);
    const locations = await this.getLocationEntities(dto.locationIds);
    const employer = await this.getEmployerEntityByUserId(userId);

    // 5. Create the Job entity
    const jobToCreate = this.jobRepo.create({
      ...dto, // Spread all properties from the DTO
      slug: slugify(dto.title), // Generate slug from title
      employer, // Assign the fetched Employer entity
      category, // Assign the fetched Category entity
      skills, // Assign the fetched Skill entities
      locations, // Assign the fetched Location entities
      postedAt: new Date(), // Set creation date
      isActive: true, // Default to active
      // expiresAt: // Optionally calculate based on config or dto input
    });

    // 6. Save the job to the database
    const newJob = await this.jobRepo.save(jobToCreate);

    const fullNewJob = await this.getJobEntityBySlug(newJob.slug, [
      "employer",
      "category",
      "skills",
      "locations",
    ]);

    const jobDto = JobOutputDto.fromEntity(fullNewJob);
    // After saving, reload the job with all relations if JobOutputDto needs them
    // The `save` method might not return all relations pre-loaded.
    // If JobOutputDto expects nested relation data, you might need a `findOne` call here.
    return jobDto;
  };

  updateJob = async (
    slug: string,
    dto: UpdateJobDto,
    employerId: string
  ): Promise<JobOutputDto> => {
    // 1. Find the job to update with necessary relations for ownership check and current values
    const jobToUpdate = await this.getJobEntityBySlug(slug, [
      "employer",
      "category",
      "skills",
      "locations",
    ]);

    // 2. Ownership check: Ensure the authenticated employer owns this job.
    // The employer relation on jobToUpdate should be loaded by getJobBySlug.
    if (jobToUpdate.employer.id !== employerId) {
      throw new AppError("Forbidden: You do not own this job.", 403); // Added 403 status
    }

    // 3. Update Category if provided in DTO
    let category: Category = jobToUpdate.category; // Default to existing category
    if (dto.categoryId && dto.categoryId !== jobToUpdate.category.id) {
      category = await this.getCategoryEntity(dto.categoryId);
    }
    // If dto.categoryId is undefined or the same as existing, 'category' remains 'jobToUpdate.category'

    // 4. Update Skills if provided in DTO
    let skills = jobToUpdate.skills; // Default to existing skills
    if (dto.skillIds !== undefined) {
      // Check if skillIds array is explicitly provided (even if empty)
      skills = await this.getSkillEntities(dto.skillIds);
    }

    // 5. Update Locations if provided in DTO
    let locations = jobToUpdate.locations; // Default to existing locations
    if (dto.locationIds !== undefined) {
      // Check if locationIds array is explicitly provided (even if empty)
      locations = await this.getLocationEntities(dto.locationIds);
    }

    // 6. Apply scalar updates (only if property exists in DTO)
    // Object.assign is a concise way to apply updates for optional fields
    Object.assign(jobToUpdate, {
      title: dto.title,
      description: dto.description,
      requirements: dto.requirements,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      employmentType: dto.employmentType,
      experienceLevel: dto.experienceLevel,
      // You might not want to allow updating isActive or postedAt directly via PUT
      // isActive: dto.isActive,
      // expiresAt: dto.expiresAt,
    });

    // Update slug if title changed
    if (dto.title && dto.title !== jobToUpdate.title) {
      jobToUpdate.slug = slugify(dto.title);
    }

    // 7. Assign updated relations
    jobToUpdate.category = category;
    jobToUpdate.skills = skills;
    jobToUpdate.locations = locations;

    // 8. Save the updated job
    const updatedJob = await this.jobRepo.save(jobToUpdate);

    const fullUpdatedJob = await this.getJobEntityBySlug(updatedJob.slug, [
      "employer",
      "category",
      "skills",
      "locations",
    ]);

    const jobDto = JobOutputDto.fromEntity(fullUpdatedJob);
    // 9. Return the job with all relations reloaded for the response DTO
    return jobDto;
  };

  /**
   * Deletes a job posting.
   * @param slug The slug of the job to delete.
   * @param employerId The ID of the authenticated employer.
   * @returns A promise resolving to void.
   */
  deleteJob = async (slug: string, employerId: string): Promise<void> => {
    // 1. Find the job to delete with employer relation for ownership check
    const jobToDelete = await this.getJobEntityBySlug(slug, ["employer"]);

    // 2. Ownership check: Ensure the authenticated employer owns this job.
    if (jobToDelete.employer.id !== employerId)
      throw new AppError("Forbidden: You do not own this job.", 403);

    // 3. Remove the job from the database.
    await this.jobRepo.remove(jobToDelete);
  };
}
