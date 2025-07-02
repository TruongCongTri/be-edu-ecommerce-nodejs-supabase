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
import { Employer } from "../../database/entities/Employer";

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
  // Filtration logic for jobs
  // getAllFilteredJobs = async (
  //   filter: JobFilterParams
  // ): Promise<JobFilterResult> => {
  //   const {
  //     page = 1,
  //     per_page = 10,
  //     search,
  //     categoryId,
  //     skillIds,
  //     locationIds,
  //     salaryMin,
  //     salaryMax,
  //   } = filter;

  //   const skip = (page - 1) * per_page;

  //   // CASE 1: If skillIds or locationIds present, fallback to QueryBuilder
  //   if (skillIds?.length || locationIds?.length) {
  //     const qb = this.jobRepo
  //       .createQueryBuilder("job")
  //       .leftJoinAndSelect("job.skills", "skill")
  //       .leftJoinAndSelect("job.locations", "location")
  //       .leftJoinAndSelect("job.category", "category")
  //       .leftJoinAndSelect("job.employer", "employer")
  //       .where("job.isActive = true");

  //     if (search) {
  //       qb.andWhere(
  //         "(job.title ILIKE :search OR job.description ILIKE :search)",
  //         { search: `%${search}%` }
  //       );
  //     }

  //     if (categoryId) {
  //       qb.andWhere("category.id = :categoryId", { categoryId });
  //     }

  //     if (salaryMin !== undefined) {
  //       qb.andWhere("job.salaryMin >= :salaryMin", { salaryMin });
  //     }

  //     if (salaryMax !== undefined) {
  //       qb.andWhere("job.salaryMax <= :salaryMax", { salaryMax });
  //     }

  //     if (skillIds?.length) {
  //       qb.andWhere(
  //         `job.id IN (
  //         SELECT js.job_id FROM jobs_skills js
  //         WHERE js.skill_id IN (:...skillIds)
  //       )`,
  //         { skillIds }
  //       );
  //     }

  //     if (locationIds?.length) {
  //       qb.andWhere(
  //         `job.id IN (
  //         SELECT jl.job_id FROM jobs_locations jl
  //         WHERE jl.location_id IN (:...locationIds)
  //       )`,
  //         { locationIds }
  //       );
  //     }

  //     const [jobs, total] = await qb
  //       .skip(skip)
  //       .take(per_page)
  //       .orderBy("job.createdAt", "DESC")
  //       .getManyAndCount();

  //     return {
  //       data: { jobs },
  //       pagination: {
  //         current_page: page,
  //         per_page,
  //         total,
  //         total_page: Math.ceil(total / per_page),
  //       },
  //     };
  //   }

  //   // CASE 2: Use simple repository .find() when no skill/location filters
  //   const where: FindOptionsWhere<Job> = {
  //     isActive: true,
  //     ...(search && {
  //       // match title or description
  //       title: ILike(`%${search}%`),
  //     }),
  //     ...(categoryId && {
  //       category: { id: categoryId },
  //     }),
  //     ...(salaryMin !== undefined && {
  //       salaryMin: MoreThanOrEqual(salaryMin),
  //     }),
  //     ...(salaryMax !== undefined && {
  //       salaryMax: LessThanOrEqual(salaryMax),
  //     }),
  //   };

  //   const [jobs, total] = await this.jobRepo.findAndCount({
  //     where: [
  //       where,
  //       ...(search
  //         ? [
  //             {
  //               ...where,
  //               description: ILike(`%${search}%`),
  //               title: undefined, // prevent conflict if both present
  //             },
  //           ]
  //         : []),
  //     ],
  //     relations: ["skills", "locations", "category", "employer"],
  //     order: { createdAt: "DESC" },
  //     skip,
  //     take: per_page,
  //   });

  //   return {
  //     data: { jobs },
  //     pagination: {
  //       current_page: page,
  //       per_page,
  //       total,
  //       total_page: Math.ceil(total / per_page),
  //     },
  //   };
  // };
  getAllFilteredJobs = async (
    filter: JobFilterParams
  ): Promise<JobFilterResult> => {
    const {
      page = 1,
      per_page = 10,
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
      page = 1,
      per_page = 10,
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

  // Fetch all jobs without any filters
  getAllJobs = async (): Promise<Job[]> => {
    return this.jobRepo.find({
      order: { createdAt: "DESC" },
    });
  };
  getAllJobDetails = async (): Promise<Job[]> => {
    return this.jobRepo.find({
      relations: ["employer", "category", "skills", "locations"],
      order: { createdAt: "DESC" },
    });
  };

  // no use
  getAllFilteredJobsVerTwo = async (
    filter: JobFilterParams
  ): Promise<JobFilterResult> => {
    const {
      page = 1,
      per_page = 10,
      search,
      categoryId,
      skillIds,
      locationIds,
      salaryMin,
      salaryMax,
    } = filter;

    const where: FindManyOptions<Job>["where"] = {
      isActive: true,
    };

    // 🔍 Search by title or description
    if (search) {
      where["title"] = ILike(`%${search}%`);
      where["description"] = ILike(`%${search}%`);
    }

    // 📂 Filter by category
    if (categoryId) {
      where["category"] = { id: categoryId };
    }

    // 💰 Salary filter
    if (salaryMin !== undefined || salaryMax !== undefined) {
      where["salaryMin"] = salaryMin;
      where["salaryMax"] = salaryMax;
    }

    const skip = (page - 1) * per_page;
    const findOptions: FindManyOptions<Job> = {
      where,
      relations: ["skills", "locations", "category", "employer"],
      skip,
      take: per_page,
      order: { createdAt: "DESC" },
    };

    // 🧠 Filter by skills and 📍 locations — post-query filtering
    let jobs = await this.jobRepo.find(findOptions);

    // 🧠 Filter skills (at least one match)
    if (skillIds?.length) {
      jobs = jobs.filter((job) =>
        job.skills.some((skill) => skillIds.includes(skill.id))
      );
    }

    // 📍 Filter locations (at least one match)
    if (locationIds?.length) {
      jobs = jobs.filter((job) =>
        job.locations.some((loc) => locationIds.includes(loc.id))
      );
    }

    const total = jobs.length;
    const paginated = jobs.slice(0, per_page); // in case filtering removed items

    return {
      data: { jobs: paginated },
      pagination: {
        current_page: page,
        per_page,
        total,
        total_page: Math.ceil(total / per_page),
      },
    };
  };
  jobFilter = async (filter: JobFilterParams): Promise<JobFilterResult> => {
    const {
      page = 1,
      per_page = 10,
      search,
      categoryId,
      skillIds,
      locationIds,
      salaryMin,
      salaryMax,
    } = filter; // Destructure filter params and apply default pagination if not provided

    const skip = (page - 1) * per_page;

    // Step 1: Use repository `find` with where conditions for basic filters
    const where: FindOptionsWhere<Job> = {
      isActive: true,
      ...(categoryId ? { category: { id: categoryId } } : {}), // Exact match	- FindOptionsWhere
      ...(salaryMin !== undefined
        ? { salaryMin: MoreThanOrEqual(salaryMin) }
        : {}), // within range - MoreThanOrEqual
      ...(salaryMax !== undefined
        ? { salaryMax: LessThanOrEqual(salaryMax) }
        : {}), // within range - LessThanOrEqual
    };

    let jobs = await this.jobRepo.find({
      where,
      relations: ["skills", "locations", "category", "employer"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    // Step 2: Filter in-memory for search (title/description)
    if (search) {
      const lowerSearch = search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerSearch) ||
          job.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Step 3: Use queryBuilder only for skill/location ANY MATCH
    if (skillIds?.length || locationIds?.length) {
      const builder = this.jobRepo.createQueryBuilder("job").select("job.id");

      if (skillIds?.length) {
        builder.andWhere(
          `job.id IN (
            SELECT js.job_id FROM jobs_skills js WHERE js.skill_id IN (:...skillIds)
          )`,
          { skillIds }
        );
      }
      if (locationIds?.length) {
        builder.andWhere(
          `job.id IN (
            SELECT jl.job_id FROM jobs_locations jl WHERE jl.location_id IN (:...locationIds)
          )`,
          { locationIds }
        );
      }

      const matchingJobIds = (await builder.getMany()).map((j) => j.id);

      jobs = jobs.filter((job) => matchingJobIds.includes(job.id));
    }

    const total = jobs.length;
    const paginatedJobs = jobs.slice(skip, skip + per_page);
    console.log("number of current jobs: ", paginatedJobs.length);

    return {
      data: { jobs: paginatedJobs },
      pagination: {
        current_page: page,
        per_page,
        total,
        total_page: Math.ceil(total / per_page),
      },
    };
  };

  getJobBySlug = async (slug: string): Promise<Job> => {
    try {
      const job = await this.jobRepo.findOneOrFail({
        where: { slug },
      });
      return job;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new AppError(`Job with Slug ${slug} not found.`, 404);
      }
      throw error;
    }
  };
  getJobDetailBySlug = async (slug: string): Promise<Job> => {
    const job = await this.jobRepo.findOne({
      where: { slug },
      relations: ["employer", "category", "skills", "locations"],
    });
    if (!job) throw new AppError("Job not found");
    return job;
  };

  createJob = async (dto: CreateJobDto, userId: string): Promise<Job> => {
    // 1. Validate and fetch Category
    const category = await this.cateRepo.findOneBy({
      id: dto.categoryId,
    });
    if (!category) throw new AppError("Category not found", 404);

    // 2. Validate and fetch Skills
    // Ensure skillIds array is not empty before querying, though DTO validation handles ArrayNotEmpty.
    const skills = dto.skillIds?.length > 0 ? await this.skillRepo.findBy({ id: In(dto.skillIds) }) : [];
    // Optional: Check if all provided skill IDs actually exist in the database
    if (skills.length !== dto.skillIds?.length) {
      // You could be more specific here and list which IDs were not found
      throw new AppError("One or more provided skill IDs are invalid.", 400);
    }

    // 3. Validate and fetch Locations
    const locations = dto.locationIds?.length > 0 ? await this.locationRepo.findBy({ id: In(dto.locationIds) }) : [];
    // Optional: Check if all provided location IDs actually exist in the database
    if (locations.length !== dto.locationIds?.length) {
      throw new AppError("One or more provided location IDs are invalid.", 400);
    }

    // 4. Fetch Employer based on authenticated userId
    const employer = await this.employerRepo.findOne({
      where: { user: { id: userId } }, // Assuming Employer entity has a ManyToOne relation to User, and User has an 'id'
      relations: ["user"], // Load the user relation to filter by user.id
    });
    if (!employer) {
      // This case should ideally not happen if authorizeMiddleware is correctly set up,
      // but it's a good safety check if the user role mapping to employer is complex.
      throw new AppError("Only registered employers can post jobs.", 403);
    }
    
    // 5. Create the Job entity
    const jobToCreate = this.jobRepo.create({
      ...dto, // Spread all properties from the DTO
      slug: slugify(dto.title), // Generate slug from title
      employer,  // Assign the fetched Employer entity
      category,  // Assign the fetched Category entity
      skills,    // Assign the fetched Skill entities
      locations, // Assign the fetched Location entities
      postedAt: new Date(), // Set creation date
      isActive: true,       // Default to active
      // expiresAt: // Optionally calculate based on config or dto input
    });

    // 6. Save the job to the database
    const newJob = await this.jobRepo.save(jobToCreate);

    // After saving, reload the job with all relations if JobOutputDto needs them
    // The `save` method might not return all relations pre-loaded.
    // If JobOutputDto expects nested relation data, you might need a `findOne` call here.
    return await this.jobRepo.findOne({
      where: { id: newJob.id },
      relations: ["employer", "category", "skills", "locations", "user"], // Add any relations needed for JobOutputDto
    }) as Job; // Type assertion as findOne might return null if not found (though unlikely after save)
  };

  updateJob = async (
    slug: string,
    dto: UpdateJobDto,
    employerId: string
  ): Promise<Job> => {
    // 1. Find the job to update.
    // getJobBySlug already handles not-found error and eager-loads relations (including employer).
    const jobToUpdate = await this.getJobBySlug(slug);

    // 2. Ownership check: Ensure the authenticated employer owns this job.
    // The employer relation on jobToUpdate should be loaded by getJobBySlug.
    if (jobToUpdate.employer.id !== employerId) {
      throw new AppError("Forbidden: You do not own this job.", 403); // Added 403 status
    }

   // 3. Update Category if provided in DTO
    let category: Category = jobToUpdate.category; // Default to existing category
    if (dto.categoryId && dto.categoryId !== jobToUpdate.category.id) {
      const newCategory = await this.cateRepo.findOneBy({ id: dto.categoryId });
      if (!newCategory) {
        // If the new category ID doesn't exist, throw an error
        throw new AppError("Provided category not found.", 404);
      }
      category = newCategory; // Assign the fetched Category instance
    }
    // If dto.categoryId is undefined or the same as existing, 'category' remains 'jobToUpdate.category'
    
    // 4. Update Skills if provided in DTO
    let skills = jobToUpdate.skills; // Default to existing skills
    if (dto.skillIds !== undefined) { // Check if skillIds array is explicitly provided (even if empty)
      if (dto.skillIds.length > 0) {
        skills = await this.skillRepo.findBy({ id: In(dto.skillIds) });
        if (skills.length !== dto.skillIds.length) {
          throw new AppError("One or more provided skill IDs are invalid.", 400);
        }
      } else {
        skills = []; // If empty array is provided, clear all skills
      }
    }

    // 5. Update Locations if provided in DTO
    let locations = jobToUpdate.locations; // Default to existing locations
    if (dto.locationIds !== undefined) { // Check if locationIds array is explicitly provided (even if empty)
      if (dto.locationIds.length > 0) {
        locations = await this.locationRepo.findBy({ id: In(dto.locationIds) });
        if (locations.length !== dto.locationIds.length) {
          throw new AppError("One or more provided location IDs are invalid.", 400);
        }
      } else {
        locations = []; // If empty array is provided, clear all locations
      }
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

    // 9. Return the job with all relations reloaded for the response DTO
    return await this.jobRepo.findOne({
      where: { id: updatedJob.id },
      relations: ["employer", "category", "skills", "locations", "applications"], // Include all relations needed by JobOutputDto
    }) as Job;
  };

  deleteJob = async (slug: string, employerId: string): Promise<void> => {
    // 1. Find the job to delete.
    const jobToDelete = await this.getJobBySlug(slug);

    // 2. Ownership check: Ensure the authenticated employer owns this job.
    if (jobToDelete.employer.id !== employerId) 
      throw new AppError("Forbidden: You do not own this job.", 403);
    

    // 3. Remove the job from the database.
    await this.jobRepo.remove(jobToDelete);
  };
}
