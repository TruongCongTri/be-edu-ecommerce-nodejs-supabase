import { AppError } from "../../../utils/errors/AppError";

import { slugify } from "../../../utils/helpers/slugify.helper";

import { SkillRepositoryType } from "../repositories/skill.repository";

import { Skill } from "../../database/entities/Skill";
import { SkillDto } from "../../database/dtos/skill.dto";
import { CreateSkillDto } from "../../database/dtos/create-skill.dto";
import { UpdateSkillDto } from "../../database/dtos/update-skill.dto";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { PaginationMetaDto } from "../../database/dtos/pagination-meta.dto";

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";

import { buildQueryOptions } from "../../../utils/build-query-options";
import { createPaginationMeta } from "../../../utils/helpers/pagination.helper";
import { checkForbiddenWords } from "../../../utils/forbidden-words-checker";

export class SkillService {
  private skillRepo: SkillRepositoryType;

  constructor(skillRepo: SkillRepositoryType) {
    this.skillRepo = skillRepo;
  }

  /**
   * Fetches the Skill entity by unique slug.
   * Does NOT throw if not found, as skill might need to be created.
   * @param slug The unique Slug of the associated skill.
   * @param relations Optional relations to load (e.g., ['products']).
   * @returns The Skill entity or null.
   */
  private async getSkillEntity(
    slug: string,
    relations?: { products?: boolean } // Define which relations can be loaded
  ): Promise<Skill> {
    const skill = await this.skillRepo.findOne({
      where: { slug },
      relations: relations,
    });

    if (!skill) throw new AppError("Skill not found", 404);

    return skill;
  }

  // --- Public Methods (Exposed to Controllers) ---
  getSkills = async (): Promise<{
    skills: SkillDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [skills, total] = await this.skillRepo.findAndCount();

    // --- BLOCK 4: Map Entities to DTOs ---
    const skillDtos = skills.map(SkillDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(1, total, total);
    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      skills: skillDtos,
      pagination: paginationMeta,
    };
  };
  // READ skills
  getAllSkills = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    skills: SkillDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<Skill>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name", "description"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [skills, total] = await this.skillRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const skillDtos = skills.map(SkillDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      skills: skillDtos,
      pagination: paginationMeta,
    };
  };
  getAllSkillsWithProducts = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    skills: SkillDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<Skill>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name", "description"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [skills, total] = await this.skillRepo.findAndCount({
      ...findOptions,
      relations: {
        products: true,
      },
    });
    console.log("Service:", skills);

    // --- BLOCK 4: Map Entities to DTOs ---
    const skillDtos = skills.map(SkillDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      skills: skillDtos,
      pagination: paginationMeta,
    };
  };

  // Get single skill by slug - public access
  getSkillBySlug = async (slug: string): Promise<SkillDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const skill = await this.getSkillEntity(slug);

    // --- BLOCK 2: Map Entities to DTOs ---
    const skillDto = SkillDto.fromEntity(skill);

    // --- BLOCK 3: Return Data ---
    return skillDto;
  };
  // Get single skill with its products by slug - public access
  getSkillWithProductsBySlug = async (slug: string): Promise<SkillDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const skill = await this.getSkillEntity(slug, { products: true });

    if (!skill) throw new AppError("Skill not found", 404);

    // --- BLOCK 2: Map Entities to DTOs ---
    const skillDto = SkillDto.fromEntity(skill);

    // --- BLOCK 3: Return Data ---
    return skillDto;
  };

  // CREATE new skill - restricted access for only admin
  createSkill = async (dto: CreateSkillDto): Promise<SkillDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    checkForbiddenWords(
      { name: dto.name, description: dto.description },
      "Skill"
    );

    // --- BLOCK 2: Manual check for unique name before attempting to save ---
    const existing = await this.skillRepo.findOneBy({ name: dto.name });
    if (existing) throw new AppError("Skill already exists", 409);

    // --- BLOCK 3: Create the entity instance ---
    const skillToCreate = this.skillRepo.create({
      ...dto,
      slug: slugify(dto.name),
    });
    // --- BLOCK 4: Save the new skill to the database
    const createdSkill = await this.skillRepo.save(skillToCreate);

    // --- BLOCK 5: Map Entities to DTOs ---
    const skillDto = SkillDto.fromEntity(createdSkill);

    // --- BLOCK 6: Return Data ---
    return skillDto;
  };

  // UPDATE a skill - restricted access for only admin
  updateSkill = async (
    slug: string,
    dto: UpdateSkillDto
  ): Promise<SkillDto> => {
    // --- BLOCK 1: Fetch Skill with its jobs by slug and Handle Not Found ---
    const skillToUpdate = await this.getSkillEntity(slug);

    if (!skillToUpdate) throw new AppError("Skill not found", 404);

    // --- BLOCK 2: Destructure body Parameters ---
    const { name, description } = dto;

    // --- BLOCK 3: Perform content checks using the utility function ---
    const fieldsToValidate: Record<string, string> = {};
    if (name !== undefined) fieldsToValidate.name = name;
    if (description !== undefined) fieldsToValidate.description = description;
    checkForbiddenWords(fieldsToValidate, "Skill");

    // --- BLOCK 4: Check for unique name conflict ONLY if the name is actually changing
    // This correctly avoids false positives if the name isn't being updated
    if (name !== undefined && name !== skillToUpdate.name) {
      // Explicitly check if 'name' is provided in DTO
      // Ensure 'name' is provided in DTO AND it's different
      const existing = await this.skillRepo.findOneBy({ name });
      if (existing) throw new AppError("Skill already exists", 409); // Business logic error: Category name already exists
    }

    // --- BLOCK 5: Generate slug based on the new name if provided, otherwise keep the current slug
    let updatedSlug = skillToUpdate.slug; // Default to current slug
    if (name !== undefined && name !== skillToUpdate.name) {
      updatedSlug = slugify(name); // Use the NEW name to generate the slug
    }

    // --- BLOCK 6: Merge DTO into the existing category entity
    this.skillRepo.merge(skillToUpdate, {
      ...dto,
      slug: updatedSlug, // Ensure the potentially new slug is merged
    });

    // --- BLOCK 7: Save the new category to the database
    const updatedSkill = await this.skillRepo.save(skillToUpdate);

    // --- BLOCK 8: Map Entities to DTOs ---
    const skillDto = SkillDto.fromEntity(updatedSkill);

    // --- BLOCK 9: Return Data ---
    return skillDto;
  };

  // DELETE a skill - restricted access for only admin
  deleteSkill = async (slug: string): Promise<void> => {
    // --- BLOCK 1: Call the private method to get the entity, ensuring 'products' relation is loaded ---
    const skillToDelete = await this.getSkillEntity(slug, { products: true });

    if (!skillToDelete) throw new AppError("Skill not found", 404);

    // --- BLOCK 2: Check if the skill has associated products ---
    if (skillToDelete.products && skillToDelete.products.length > 0) {
      throw new AppError(
        "Cannot delete skill: It has associated products.",
        400
      ); // Or 409 Conflict
    }

    // --- BLOCK 3: Delete the skill ---
    await this.skillRepo.remove(skillToDelete);
  };
}
