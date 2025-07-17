import { AppError } from "../../../utils/errors/AppError";

import { slugify } from "../../../utils/helpers/slugify.helper";

import { CategoryRepositoryType } from "../repositories/category.repository";

import { Category } from "../../database/entities/Category";
import { CategoryDto } from "../../database/dtos/category.dto";
import { CreateCategoryDto } from "../../database/dtos/create-category.dto";
import { UpdateCategoryDto } from "../../database/dtos/update-category.dto";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { PaginationMetaDto } from "../../database/dtos/pagination-meta.dto";

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";

import { buildQueryOptions } from "../../../utils/build-query-options";
import { createPaginationMeta } from "../../../utils/helpers/pagination.helper";
import { checkForbiddenWords } from "../../../utils/forbidden-words-checker";
import { th } from "@faker-js/faker/.";

export class CategoryService {
  private cateRepo: CategoryRepositoryType;

  constructor(cateRepo: CategoryRepositoryType) {
    this.cateRepo = cateRepo;
  }

  /**
   * Fetches the Category entity by unique slug.
   * Does NOT throw if not found, as category might need to be created.
   * @param slug The unique Slug of the associated category.
   * @param relations Optional relations to load (e.g., ['products']).
   * @returns The Category entity or null.
   */
  private async getCategoryEntity(
    slug: string,
    relations?: { products?: boolean } // Define which relations can be loaded
  ): Promise<Category | null> {
    const cate = await this.cateRepo.findOne({
      where: { slug },
      relations: relations,
    });
    return cate;
  }

  // --- Public Methods (Exposed to Controllers) ---
  getCategories = async (): Promise<{
    categories: CategoryDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 3: Execute Database Query (findAndCount) ---

    const [categories, total] = await this.cateRepo.findAndCount();
    // --- BLOCK 4: Map Entities to DTOs ---
    const cateDtos = categories.map(CategoryDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(1, total, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      categories: cateDtos,
      pagination: paginationMeta,
    };
  };
  // READ categories
  getAllCategories = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    categories: CategoryDto[];
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
    const [skills, total] = await this.cateRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        // products: {
        //   educator: true,
        // },
      },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const cateDtos = skills.map(CategoryDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      categories: cateDtos,
      pagination: paginationMeta,
    };
  };
  getAllCategoriesWithProducts = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    categories: CategoryDto[];
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
    const [skills, total] = await this.cateRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        products: {
          educator: true,
        },
      },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const cateDtos = skills.map(CategoryDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      categories: cateDtos,
      pagination: paginationMeta,
    };
  };

  // Get single Category by slug - public access
  getCategoryBySlug = async (slug: string): Promise<CategoryDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const cate = await this.getCategoryEntity(slug);

    if (!cate) throw new AppError("Category not found", 404);

    // --- BLOCK 2: Map Entities to DTOs ---
    const cateDto = CategoryDto.fromEntity(cate);

    // --- BLOCK 3: Return Data ---
    return cateDto;
  };
  // Get single Category with its products by slug - public access
  getCategoryWithProductsBySlug = async (
    slug: string
  ): Promise<CategoryDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const cate = await this.getCategoryEntity(slug, { products: true });

    if (!cate) throw new AppError("Category not found", 404);

    // --- BLOCK 2: Map Entities to DTOs ---
    const cateDto = CategoryDto.fromEntity(cate);

    // --- BLOCK 3: Return Data ---
    return cateDto;
  };

  // CREATE new Category - restricted access for only admin
  createCategory = async (dto: CreateCategoryDto): Promise<CategoryDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    checkForbiddenWords(
      { name: dto.name, description: dto.description },
      "Category"
    );

    // --- BLOCK 2: Manual check for unique name before attempting to save ---
    const existing = await this.cateRepo.findOneBy({ name: dto.name });
    if (existing) throw new AppError("Category already exists", 409);

    // --- BLOCK 3: Create the entity instance ---
    const cateToCreate = this.cateRepo.create({
      ...dto,
      slug: slugify(dto.name),
    });
    // --- BLOCK 4: Save the new category to the database
    const createdCate = await this.cateRepo.save(cateToCreate);

    // --- BLOCK 5: Map Entities to DTOs ---
    const cateDto = CategoryDto.fromEntity(createdCate);

    // --- BLOCK 6: Return Data ---
    return cateDto;
  };

  // UPDATE a skill - restricted access for only admin
  updateCategory = async (
    slug: string,
    dto: UpdateCategoryDto
  ): Promise<CategoryDto> => {
    // --- BLOCK 1: Fetch Category with its jobs by slug and Handle Not Found ---
    const cateToUpdate = await this.getCategoryEntity(slug);

    if (!cateToUpdate) throw new AppError("Category not found", 404);

    // --- BLOCK 2: Destructure body Parameters ---
    const { name, description } = dto;

    // --- BLOCK 3: Perform content checks using the utility function ---
    const fieldsToValidate: Record<string, string> = {};
    if (name !== undefined) fieldsToValidate.name = name;
    if (description !== undefined) fieldsToValidate.description = description;
    checkForbiddenWords(fieldsToValidate, "Category");

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
    const updatedCate = await this.cateRepo.save(cateToUpdate);

    // --- BLOCK 8: Map Entities to DTOs ---
    const cateDto = CategoryDto.fromEntity(updatedCate);

    // --- BLOCK 9: Return Data ---
    return cateDto;
  };

  // DELETE a Category - restricted access for only admin
  deleteCategory = async (slug: string): Promise<void> => {
    // --- BLOCK 1: Call the private method to get the entity, ensuring 'products' relation is loaded ---
    const cateToDelete = await this.getCategoryEntity(slug, { products: true });

    if (!cateToDelete) throw new AppError("Category not found", 404);

    // --- BLOCK 2: Check if the category has associated products ---
    if (cateToDelete.products && cateToDelete.products.length > 0) {
      throw new AppError(
        "Cannot delete Category: It has associated products.",
        400
      ); // Or 409 Conflict
    }

    // --- BLOCK 3: Delete the skill ---
    await this.cateRepo.remove(cateToDelete);
  };
}
