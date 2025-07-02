import { categoryRepository } from "../repositories/category.repository";

import { CreateCategoryDto } from "../../database/dtos/CreateCategory.dto";
import { UpdateCategoryDto } from "../../database/dtos/UpdateCategory.dto";

import { Category } from "../../database/entities/Category";

import { slugify } from "../../../utils/helpers/slugify";
import { AppError } from "../../../utils/errors/AppError";
import { checkForbiddenWords } from "../../../utils/forbiddenWordsChecker";
import { EntityNotFoundError } from "typeorm";
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
    // const total_page = Math.ceil(total / per_page!); // Use non-null assertion for per_page
    // const paginationMeta = new PaginationMetaDto(
    //   page!, // Use non-null assertion for page
    //   per_page!, // Use non-null assertion for per_page
    //   total,
    //   total_page
    // );
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
  getCategoryBySlug = async (slug: string): Promise<Category> => {
    try {
      const cate = await this.cateRepo.findOneOrFail({
        where: { slug },
      });
      return cate;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new AppError(`Category with Slug ${slug} not found.`, 404);
      }
      throw error;
    }
  };
  // Get single category with its jobs by slug - public access
  getCategoryWithJobsBySlug = async (slug: string): Promise<Category> => {
    try {
      const cate = await this.cateRepo.findOneOrFail({
        where: { slug },
        relations: ["jobs"],
      });
      return cate;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new AppError(`Category with Slug ${slug} not found.`, 404);
      }
      throw error;
    }
  };

  // Create new category - restricted access for only admin
  createCategory = async (dto: CreateCategoryDto): Promise<Category> => {
    // 1. Perform content checks using the utility function
    checkForbiddenWords([dto.name, dto.description || ""], "Category");

    // 2. Manual check for unique name before attempting to save
    const existing = await this.cateRepo.findOneBy({ name: dto.name });
    if (existing) throw new AppError("Category already exists", 409);

    // 3.
    const generatedSlug = slugify(dto.name);
    const existingSlug = await this.cateRepo.findOneBy({ slug: generatedSlug });
    if (existingSlug) {
      throw new AppError("Category slug already exists", 409);
    }

    // 3. Create the entity instance with slug generated from name
    const cateToCreate = this.cateRepo.create({
      ...dto,
      slug: generatedSlug,
    });

    // 4. Save the new category to the database
    return await this.cateRepo.save(cateToCreate);
  };
  // Update a category - restricted access for only admin
  updateCategory = async (
    slug: string,
    dto: UpdateCategoryDto
  ): Promise<Category> => {
    // 1. Find the category to update by slug
    // Calls getCategoryBySlug which correctly handles 404
    const cateToUpdate = await this.getCategoryBySlug(slug);

    const { name, description } = dto;

    // 2. Check for unique name conflict ONLY if the name is actually changing
    // This correctly avoids false positives if the name isn't being updated
    if (name !== undefined && name !== cateToUpdate.name) {
      // Explicitly check if 'name' is provided in DTO
      // Ensure 'name' is provided in DTO AND it's different
      const existing = await this.cateRepo.findOneBy({ name });
      if (existing) throw new AppError("Category already exists", 409); // Business logic error: Category name already exists
    }

    // 3. Prepare texts for forbidden words check
    // This is correctly getting the *effective* name and description after considering DTO updates.
    const nameToCheck = name !== undefined ? name : cateToUpdate.name;
    const descriptionToCheck =
      description !== undefined ? description : cateToUpdate.description;
    // The `|| ''` for descriptionToCheck handles cases where description might be null/undefined initially,
    // ensuring checkForbiddenWords always receives a string.
    checkForbiddenWords([nameToCheck, descriptionToCheck || ""], "Category");

    let updatedSlug = cateToUpdate.slug; // Default to current slug
    if (name !== undefined && name !== cateToUpdate.name) {
      updatedSlug = slugify(name); // Use the NEW name to generate the slug
    }
    // 4. Merge DTO into the existing category entity
    this.cateRepo.merge(cateToUpdate, {
      ...dto,
      slug: updatedSlug, // Ensure the potentially new slug is merged
    });

    // 5. Save the updated category
    // This will trigger the database unique constraint check as a final safeguard
    // if a race condition occurred between the findOneBy and save.
    return await this.cateRepo.save(cateToUpdate);
  };
  // Delete a category - restricted access for only admin
  deleteCategory = async (slug: string): Promise<void> => {
    const cateToDelete = await this.getCategoryWithJobsBySlug(slug);

    if (cateToDelete.jobs && cateToDelete.jobs.length > 0) {
      throw new AppError(
        "Cannot delete category: It has associated jobs.",
        400
      ); // Or 409 Conflict
    }

    await this.cateRepo.remove(cateToDelete);
  };
}
