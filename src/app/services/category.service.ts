import { categoryRepository } from "../repositories/category.repository";

import { CreateCategoryDto } from "../../database/dtos/CreateCategory.dto";
import { UpdateCategoryDto } from "../../database/dtos/UpdateCategory.dto";

import { Category } from "../../database/entities/Category";

import { slugify } from "../../../utils/helpers/slugify";
import { AppError } from "../../../utils/errors/AppError";
import { checkForbiddenWords } from "../../../utils/forbiddenWordsChecker";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { PaginationMetaDto } from "../../database/dtos.output/PaginationMeta.dto";
import { buildQueryOptions } from "../../../utils/buildQueryOptions";
import { CategoryOutputDto } from "../../database/dtos.output/CategoryOutput.dto";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";
import { createPaginationMeta } from "../../../utils/helpers/paginationHelper";

export class CategoryService {
  // private cateRepo = categoryRepository;
  // constructor() {}
  // Repo is injected via constructor
  constructor(private cateRepo = categoryRepository) {}

  /**
   * Private helper to fetch a Category entity by its slug, including necessary relations for internal use.
   * Throws AppError if not found.
   * @param slug The slug of the category.
   * @param withRelations An optional object to specify relations to load.
   * @returns The Category entity.
   */
  private getCategoryEntityBySlug = async (
    slug: string,
    withRelations?: { jobs?: boolean } // Define which relations can be loaded
  ): Promise<Category> => {
    // --- BLOCK 1: Fetch Category by slug and Handle Not Found ---
    const category = await this.cateRepo.findOne({
      where: { slug },
      relations: withRelations, // Dynamically load relations based on need
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // --- BLOCK 2: Return the Category entity ---
    return category;
  };

  // Get all category - public access
  getAllCategories = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    categories: CategoryOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<Category>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name", "description"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [categories, total] = await this.cateRepo.findAndCount({
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

    // --- BLOCK 4: Map Entities to DTOs ---
    const categoryDtos = categories.map(CategoryOutputDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      categories: categoryDtos,
      pagination: paginationMeta,
    };
  };
  // Get all category with their jobs - public access
  getAllCategoriesWithJobs = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    categories: CategoryOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<Category>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name", "description"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [categories, total] = await this.cateRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        jobs: {
          employer: true,
          category: true,
          skills: true,
          locations: true,
        },
      },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const categoryDtos = categories.map(CategoryOutputDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      categories: categoryDtos,
      pagination: paginationMeta,
    };
  };

  // Get single category by slug - public access
  getCategoryBySlug = async (slug: string): Promise<CategoryOutputDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const category = await this.getCategoryEntityBySlug(slug);

    // --- BLOCK 2: Map Entities to DTOs ---
    const categoryDto = CategoryOutputDto.fromEntity(category);

    // --- BLOCK 3: Return Data ---
    return categoryDto;
  };
  // Get single category with its jobs by slug - public access
  getCategoryWithJobsBySlug = async (
    slug: string
  ): Promise<CategoryOutputDto> => {
    // --- BLOCK 1: Call the private method to get the entity, ensuring 'jobs' relation is loaded ---
    const category = await this.getCategoryEntityBySlug(slug, { jobs: true });

    // --- BLOCK 2: Map Entities to DTOs ---
    const categoryDto = CategoryOutputDto.fromEntity(category);

    // --- BLOCK 3: Return Data ---
    return categoryDto;
  };

  // Create new category - restricted access for only admin
  createCategory = async (
    dto: CreateCategoryDto
  ): Promise<CategoryOutputDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    checkForbiddenWords([dto.name, dto.description || ""], "Category");

    // --- BLOCK 2: Manual check for unique name before attempting to save ---
    const existing = await this.cateRepo.findOneBy({ name: dto.name });
    if (existing) throw new AppError("Category already exists", 409);

    // --- BLOCK 3: Create the entity instance ---
    const cateToCreate = this.cateRepo.create({
      ...dto,
      slug: slugify(dto.name),
    });

    // --- BLOCK 4: Save the new category to the database ---
    const createdCategory = await this.cateRepo.save(cateToCreate);

    // --- BLOCK 5: Map Entities to DTOs ---
    const categoryDto = CategoryOutputDto.fromEntity(createdCategory);

    // --- BLOCK 6: Return Data ---
    return categoryDto;
  };
  // Update a category - restricted access for only admin
  updateCategory = async (
    slug: string,
    dto: UpdateCategoryDto
  ): Promise<CategoryOutputDto> => {
    // --- BLOCK 1: Fetch Skill with its jobs by slug and Handle Not Found ---
    const cateToUpdate = await this.getCategoryEntityBySlug(slug);

    // --- BLOCK 2: Destructure body Parameters ---
    const { name, description } = dto;

    // --- BLOCK 3: Perform content checks using the utility function ---
    // This is correctly getting the *effective* name and description after considering DTO updates.
    const nameToCheck = name !== undefined ? name : cateToUpdate.name;
    const descriptionToCheck =
      description !== undefined ? description : cateToUpdate.description;
    // The `|| ''` for descriptionToCheck handles cases where description might be null/undefined initially,
    // ensuring checkForbiddenWords always receives a string.
    checkForbiddenWords([nameToCheck, descriptionToCheck || ""], "Category");

    // --- BLOCK 4: Check for unique name conflict ONLY if the name is actually changing
    // This correctly avoids false positives if the name isn't being updated
    if (name !== undefined && name !== cateToUpdate.name) {
      // Explicitly check if 'name' is provided in DTO
      // Ensure 'name' is provided in DTO AND it's different
      const existing = await this.cateRepo.findOneBy({ name });
      if (existing) throw new AppError("Category already exists", 409); // Business logic error: Category name already exists
    }

    // --- BLOCK 5: Generate slug based on the new name if provided, otherwise keep the current slug
    let updatedSlug = cateToUpdate.slug; // Default to current slug
    if (name !== undefined && name !== cateToUpdate.name) {
      updatedSlug = slugify(name); // Use the NEW name to generate the slug
    }

    // --- BLOCK 6: Merge DTO into the existing category entity
    this.cateRepo.merge(cateToUpdate, {
      ...dto,
      slug: updatedSlug, // Ensure the potentially new slug is merged
    });

    // --- BLOCK 7: Save the new category to the database
    const updatedCategory = await this.cateRepo.save(cateToUpdate);

    // --- BLOCK 8: Map Entities to DTOs ---
    const categoryDto = CategoryOutputDto.fromEntity(updatedCategory);

    // --- BLOCK 9: Return Data ---
    return categoryDto;
  };

  // Delete a category - restricted access for only admin
  deleteCategory = async (slug: string): Promise<void> => {
    // --- BLOCK 1: Call the private method to get the entity, ensuring 'jobs' relation is loaded ---
    const cateToDelete = await this.getCategoryEntityBySlug(slug, {
      jobs: true,
    });

    // --- BLOCK 2: Check if the category has associated jobs ---
    if (cateToDelete.jobs && cateToDelete.jobs.length > 0) {
      throw new AppError(
        "Cannot delete category: It has associated jobs.",
        400
      ); // Or 409 Conflict
    }

    // --- BLOCK 3: Delete the skill ---
    await this.cateRepo.remove(cateToDelete);
  };
}
