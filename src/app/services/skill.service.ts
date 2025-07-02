import { skillRepository } from "../repositories/skill.repository";
import { Skill } from "../../database/entities/Skill";

import { CreateSkillDto } from "../../database/dtos/CreateSkill.dto";
import { UpdateSkillDto } from "../../database/dtos/UpdateSkill.dto";

import { slugify } from "../../../utils/helpers/slugify";
import { AppError } from "../../../utils/errors/AppError";
import { checkForbiddenWords } from "../../../utils/forbiddenWordsChecker";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { SkillOutputDto } from "../../database/dtos.output/SkillOutput.dto";
import { PaginationMetaDto } from "../../database/dtos.output/PaginationMeta.dto";
import { buildQueryOptions } from "../../../utils/buildQueryOptions";

export class SkillService {
  // private skillRepo = skillRepository;
  // constructor() {}

  // Repo is injected via constructor
  constructor(private skillRepo = skillRepository) {}

  // Get all skills - public access
  getAllSkills = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    skills: SkillOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    const { page = 1, per_page = 10 } = queryParams; // Destructure page and per_page for calculations

    //1. Use the utility to build the find options
    const findOptions = buildQueryOptions<Skill>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    //2. Fetch all applications belonging to this job seeker,
    const [skills, total] = await this.skillRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        // jobs: {
        //   employer: true,
        //   category: true,
        //   skills: true,
        //   locations: true,
        // },
      },
    });
    // 3. Map the retrieved Application entities to ApplicationOutputDto instances.
    const skillDtos = skills.map(SkillOutputDto.fromEntity);

    // 4. Calculate pagination metadata
    const total_page = Math.ceil(total / per_page!); // Use non-null assertion for per_page
    const paginationMeta = new PaginationMetaDto(
      page!, // Use non-null assertion for page
      per_page!, // Use non-null assertion for per_page
      total,
      total_page
    );
    // Return an object containing both the data and the pagination metadata
    return {
      skills: skillDtos,
      pagination: paginationMeta,
    };
  };
  // Get all skills - public access
  getAllSkillsWithJobs = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    skills: SkillOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    const { page = 1, per_page = 10 } = queryParams; // Destructure page and per_page for calculations

    //1. Use the utility to build the find options
    const findOptions = buildQueryOptions<Skill>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    //2. Fetch all applications belonging to this job seeker,
    const [skills, total] = await this.skillRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        jobs: true,
      },
    });
    // 3. Map the retrieved Application entities to ApplicationOutputDto instances.
    const skillDtos = skills.map(SkillOutputDto.fromEntity);

    // 4. Calculate pagination metadata
    const total_page = Math.ceil(total / per_page!); // Use non-null assertion for per_page
    const paginationMeta = new PaginationMetaDto(
      page!, // Use non-null assertion for page
      per_page!, // Use non-null assertion for per_page
      total,
      total_page
    );
    // Return an object containing both the data and the pagination metadata
    return {
      skills: skillDtos,
      pagination: paginationMeta,
    };
  };
  // Get single skill by slug - public access
  getSkillBySlug = async (slug: string): Promise<Skill> => {
    const skill = await this.skillRepo.findOne({
      where: { slug },
    });
    if (!skill) throw new AppError("Skill not found", 404);
    return skill;
  };
  // Get single skill with its jobs by slug - public access
  getSkillWithJobsBySlug = async (slug: string): Promise<Skill> => {
    const skill = await this.skillRepo.findOne({
      where: { slug },
      relations: ["jobs"],
    });
    if (!skill) throw new AppError("Skill not found", 404);
    return skill;
  };

  // Create new skill - restricted access for only admin
  createSkill = async (dto: CreateSkillDto): Promise<Skill> => {
    // 1. Perform content checks using the utility function
    checkForbiddenWords([dto.name], "Skill");

    // 2. Manual check for unique name before attempting to save
    const existing = await this.skillRepo.findOneBy({ name: dto.name });
    if (existing) throw new AppError("Skill already exists", 409);

    const skillToCreate = this.skillRepo.create({
      ...dto,
      slug: slugify(dto.name),
    });
    // 3. Save the new category to the database
    return await this.skillRepo.save(skillToCreate);
  };
  // Update a skill - restricted access for only admin
  updateSkill = async (slug: string, dto: UpdateSkillDto): Promise<Skill> => {
    // 1. Find the skill to update by slug
    // Calls getSkillBySlug which correctly handles 404
    const skillToUpdate = await this.getSkillBySlug(slug);
    if (!skillToUpdate) throw new AppError("Skill not found", 404);

    const { name } = dto;
    console.log("Service - name: ", name);

    // 2. Check for unique name conflict ONLY if the name is actually changing
    // This correctly avoids false positives if the name isn't being updated
    if (name !== undefined && name !== skillToUpdate.name) {
      // Explicitly check if 'name' is provided in DTO
      // Ensure 'name' is provided in DTO AND it's different
      const existing = await this.skillRepo.findOneBy({ name });
      if (existing) throw new AppError("Skill already exists", 409); // Business logic error: Category name already exists
    }

    // 3. Prepare texts for forbidden words check
    // This is correctly getting the *effective* name and description after considering DTO updates.
    const nameToCheck = name !== undefined ? name : skillToUpdate.name;
    // ensuring checkForbiddenWords always receives a string.
    checkForbiddenWords([nameToCheck], "Skill");

    let updatedSlug = skillToUpdate.slug; // Default to current slug
    if (name !== undefined && name !== skillToUpdate.name) {
      updatedSlug = slugify(name); // Use the NEW name to generate the slug
    }

    // 4. Merge DTO into the existing category entity
    this.skillRepo.merge(skillToUpdate, {
      ...dto,
      slug: updatedSlug, // Ensure the potentially new slug is merged
    });

    // 5. Save the updated category
    return await this.skillRepo.save(skillToUpdate);
  };
  // Delete a skill - restricted access for only admin
  deleteSkill = async (slug: string): Promise<void> => {
    const skillToDelete = await this.getSkillWithJobsBySlug(slug);

    if (skillToDelete.jobs && skillToDelete.jobs.length > 0) {
      throw new AppError("Cannot delete skill: It has associated jobs.", 400); // Or 409 Conflict
    }

    await this.skillRepo.remove(skillToDelete);
  };
}
