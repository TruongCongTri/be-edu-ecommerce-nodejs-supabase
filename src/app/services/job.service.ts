import { jobRepository } from "../repositories/job.repository";
import { Job } from "../../database/entities/Job";

import { CreateJobDto } from "../../database/dtos/CreateJob.dto";
import { UpdateJobDto } from "../../database/dtos/UpdateJob.dto";

import { slugify } from "../../../utils/helpers/slugify";
import { AppError } from "../../../utils/errors/AppError";
import { categoryRepository } from "../repositories/category.repository";
import { skillRepository } from "../repositories/skill.repository";
import {
  employerRepository,
  userRepository,
} from "../repositories/user.repository";
import { locationRepository } from "../repositories/location.repository";
import {
  Between,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";
import { JobFilterParams } from "../../database/dtos/JobFilterParams.dto";
import { length } from "class-validator";

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
  private jobRepo = jobRepository;
  private cateRepo = categoryRepository;
  private skillRepo = skillRepository;
  private locationRepo = locationRepository;
  private employerRepo = employerRepository;

  constructor() {}

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

    // CASE 1: If skillIds or locationIds present, fallback to QueryBuilder
    if (skillIds?.length || locationIds?.length) {
      const qb = this.jobRepo
        .createQueryBuilder("job")
        .leftJoinAndSelect("job.skills", "skill")
        .leftJoinAndSelect("job.locations", "location")
        .leftJoinAndSelect("job.category", "category")
        .leftJoinAndSelect("job.employer", "employer")
        .where("job.isActive = true");

      if (search) {
        qb.andWhere(
          "(job.title ILIKE :search OR job.description ILIKE :search)",
          { search: `%${search}%` }
        );
      }

      if (categoryId) {
        qb.andWhere("category.id = :categoryId", { categoryId });
      }

      if (salaryMin !== undefined) {
        qb.andWhere("job.salaryMin >= :salaryMin", { salaryMin });
      }

      if (salaryMax !== undefined) {
        qb.andWhere("job.salaryMax <= :salaryMax", { salaryMax });
      }

      if (skillIds?.length) {
        qb.andWhere(
          `job.id IN (
          SELECT js.job_id FROM jobs_skills js
          WHERE js.skill_id IN (:...skillIds)
        )`,
          { skillIds }
        );
      }

      if (locationIds?.length) {
        qb.andWhere(
          `job.id IN (
          SELECT jl.job_id FROM jobs_locations jl
          WHERE jl.location_id IN (:...locationIds)
        )`,
          { locationIds }
        );
      }

      const [jobs, total] = await qb
        .skip(skip)
        .take(per_page)
        .orderBy("job.createdAt", "DESC")
        .getManyAndCount();

      return {
        data: { jobs },
        pagination: {
          current_page: page,
          per_page,
          total,
          total_page: Math.ceil(total / per_page),
        },
      };
    }

    // CASE 2: Use simple repository .find() when no skill/location filters
    const where: FindOptionsWhere<Job> = {
      isActive: true,
      ...(search && {
        // match title or description
        title: ILike(`%${search}%`),
      }),
      ...(categoryId && {
        category: { id: categoryId },
      }),
      ...(salaryMin !== undefined && {
        salaryMin: MoreThanOrEqual(salaryMin),
      }),
      ...(salaryMax !== undefined && {
        salaryMax: LessThanOrEqual(salaryMax),
      }),
    };

    const [jobs, total] = await this.jobRepo.findAndCount({
      where: [
        where,
        ...(search
          ? [
              {
                ...where,
                description: ILike(`%${search}%`),
                title: undefined, // prevent conflict if both present
              },
            ]
          : []),
      ],
      relations: ["skills", "locations", "category", "employer"],
      order: { createdAt: "DESC" },
      skip,
      take: per_page,
    });

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

  getAllJobs = async (): Promise<Job[]> => {
    return this.jobRepo.find({
      order: { createdAt: "DESC" },
    });
  };
  getAllEmployerJobs = async (employerId: string): Promise<Job[]> => {
    return this.jobRepo.find({
      where: { employer: { userId: employerId } }, // employerId comes from token
      relations: ["employer"], // make sure this relation exists
      order: { createdAt: "DESC" },
    });
  };
  getAllJobDetails = async (): Promise<Job[]> => {
    return this.jobRepo.find({
      relations: ["employer", "category", "skills", "locations"],
      order: { createdAt: "DESC" },
    });
  };
  getJobBySlug = async (slug: string): Promise<Job> => {
    const job = await this.jobRepo.findOne({
      where: { slug },
    });
    if (!job) throw new AppError("Job not found");
    return job;
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
    console.log(dto.categoryId);
    const category = await this.cateRepo.findOneBy({
      id: dto.categoryId,
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    console.log(category);

    console.log(dto.skillIds);
    const skills = await this.skillRepo.findBy({
      id: In(dto.skillIds || []),
    });
    console.log(skills);

    console.log(dto.locationIds);
    const locations = await this.locationRepo.findBy({
      id: In(dto.locationIds || []),
    });
    console.log(locations);

    console.log(userId);
    const employer = await this.employerRepo.findOne({
      where: { user: { id: userId } }, // userId comes from token
      relations: ["user"], // make sure this relation exists
    });
    if (!employer) {
      throw new AppError("Only registered employers can post jobs.", 403);
    }
    console.log(employer);

    const jobToCreate = this.jobRepo.create({
      ...dto,
      slug: slugify(dto.title),
      employer,
      category,
      skills,
      locations,
    });

    return await this.jobRepo.save(jobToCreate);
  };

  updateJob = async (
    slug: string,
    dto: UpdateJobDto,
    employerId: string
  ): Promise<Job> => {
    const jobToUpdate = await this.getJobBySlug(slug);

    if (jobToUpdate.employer.id !== employerId) {
      throw new AppError("You do not own this job");
    }

    const category = await this.cateRepo.findOneByOrFail({
      id: dto.categoryId,
    });

    const skills = await this.skillRepo.findBy({
      id: In(dto.skillIds || []),
    });

    const locations = await this.locationRepo.findBy({
      id: In(dto.locationIds || []),
    });

    jobToUpdate.title = dto.title || jobToUpdate.title;
    jobToUpdate.description = dto.description || jobToUpdate.description;
    jobToUpdate.salaryMin = dto.salaryMin || jobToUpdate.salaryMin;
    jobToUpdate.salaryMax = dto.salaryMax || jobToUpdate.salaryMax;
    jobToUpdate.category = category;
    jobToUpdate.skills = skills;
    jobToUpdate.locations = locations;

    return await this.jobRepo.save(jobToUpdate);
  };

  deleteJob = async (slug: string, employerId: string): Promise<void> => {
    const jobToDelete = await this.getJobBySlug(slug);

    if (!jobToDelete) {
      throw new AppError("Job not found");
    }
    if (jobToDelete.employer.id !== employerId) {
      throw new AppError("You do not own this job");
    }
    await this.jobRepo.remove(jobToDelete);
  };
}
