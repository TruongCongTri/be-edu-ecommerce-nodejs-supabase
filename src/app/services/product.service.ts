import { In } from "typeorm";

import { AppError } from "../../../utils/errors/AppError";

import { Skill } from "../../database/entities/Skill";
import { Product } from "../../database/entities/Product";
import { Category } from "../../database/entities/Category";
import { EducatorDetail } from "../../database/entities/EducatorDetail";

import { CategoryRepositoryType } from "../repositories/category.repository";
import { ProductRepositoryType } from "../repositories/product.repository";
import { EducatorRepositoryType } from "../repositories/user.repository";
import { SkillRepositoryType } from "../repositories/skill.repository";

import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { PaginationMetaDto } from "../../database/dtos/pagination-meta.dto";
import { ProductDto } from "../../database/dtos/product.dto";
import { UpdateProductDto } from "../../database/dtos/update-product.dto";
import { CreateProductDto } from "../../database/dtos/create-product.dto";

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";

import { buildQueryOptions } from "../../../utils/build-query-options";
import { checkForbiddenWords } from "../../../utils/forbidden-words-checker";
import { slugify } from "../../../utils/helpers/slugify.helper";
import { createPaginationMeta } from "../../../utils/helpers/pagination.helper";

export class ProductService {
  private productRepo: ProductRepositoryType;
  private cateRepo: CategoryRepositoryType;
  private skillRepo: SkillRepositoryType;
  private educatorRepo: EducatorRepositoryType;

  // Constructor now accepts repositories as arguments
  // This is where DI happens!
  constructor(
    productRepo: ProductRepositoryType,
    cateRepo: CategoryRepositoryType,
    skillRepo: SkillRepositoryType,
    educatorRepo: EducatorRepositoryType
  ) {
    this.productRepo = productRepo;
    this.cateRepo = cateRepo;
    this.skillRepo = skillRepo;
    this.educatorRepo = educatorRepo;
  }

  // --- Private Helper Methods (Internal Entity Fetching & Validation) ---
  /**
   * Fetches the Product entity by unique slug.
   * @param slug The unique Slug of the associated Product.
   * @param relations Optional relations to load.
   * @returns The Product entity.
   */
  private async getProductEntity(
    slug: string,
    relations?: {
      category?: boolean;
      skills?: boolean;
      educator?: boolean;
      curriculum?: boolean;
    } // Define which relations can be loaded
  ): Promise<Product> {
    const productToFind = await this.productRepo.findOne({
      where: { slug },
      relations: relations,
    });

    if (!productToFind) throw new AppError("Product not found", 404);

    return productToFind;
  }
  private async getCategoryEntity(
    slug: string,
    relations?: { products?: boolean } // Define which relations can be loaded
  ): Promise<Category> {
    const cateToFind = await this.cateRepo.findOne({
      where: { slug },
      relations: relations,
    });

    if (!cateToFind) throw new AppError("Category not found", 404);

    return cateToFind;
  }
  private async getSkillEntities(slugs: string[]): Promise<Skill[]> {
    if (!slugs || slugs.length === 0) {
      return [];
    }
    const skillsToFind = await this.skillRepo.findBy({
      id: In(slugs),
    });

    if (skillsToFind.length !== slugs.length) {
      throw new AppError("One or more provided skill IDs are invalid.", 400);
    }

    return skillsToFind;
  }
  private async getEducatorEntityByUserId(
    userId: string
  ): Promise<EducatorDetail> {
    // ... (implementation as before) ...
    const educatorToFind = await this.educatorRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });
    if (!educatorToFind) {
      throw new AppError(
        "Only registered educator can post or manage products.",
        403
      );
    }
    return educatorToFind;
  }
  // --- Public Methods (Exposed to Controllers) ---
  // READ products
  getAllProducts = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    products: ProductDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<Product>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name", "short_desc", "long_desc"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [products, total] = await this.productRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        category: true,
        skills: true,
        educator: true,
      },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const productDtos = products.map(ProductDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      products: productDtos,
      pagination: paginationMeta,
    };
  };
  // READ products
  getAllProductsOfEducator = async (
    queryParams: BaseQueryParamsDto,
    educatorId: string
  ): Promise<{
    products: ProductDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<Product>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name", "short_desc", "long_desc"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Add Educator Filter ---
    const educatorFilter = {
      educator: {
        id: educatorId,
      },
    };

    // Merge educator filter with any existing 'where' in findOptions
    const where = findOptions.where
      ? { ...findOptions.where, educator: { id: educatorId } }
      : { educator: { id: educatorId } };

    // --- BLOCK 4: Execute Database Query (findAndCount) ---
    const [products, total] = await this.productRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      where,
      relations: {
        category: true,
        skills: true,
        educator: true,
      },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const productDtos = products.map(ProductDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      products: productDtos,
      pagination: paginationMeta,
    };
  };
  // Get single product by slug - public access
  getProductBySlug = async (slug: string): Promise<ProductDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const productToFind = await this.getProductEntity(slug);

    // --- BLOCK 2: Map Entities to DTOs ---
    const prodDto = ProductDto.fromEntity(productToFind);

    // --- BLOCK 3: Return Data ---
    return prodDto;
  };
  // Get single product with its related data by slug - public access
  getProductWithRelatedDataBySlug = async (
    slug: string
  ): Promise<ProductDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const productToFind = await this.getProductEntity(slug, {
      category: true,
      skills: true,
      educator: true,
      curriculum: true,
    });

    // --- BLOCK 2: Map Entities to DTOs ---
    const prodDto = ProductDto.fromEntity(productToFind);

    // --- BLOCK 3: Return Data ---
    return prodDto;
  };

  // CREATE new Product - restricted access for only admin
  createProduct = async (
    dto: CreateProductDto,
    educatorId: string
  ): Promise<ProductDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    checkForbiddenWords(
      { name: dto.name, shortDesc: dto.shortDesc, longDesc: dto.longDesc },
      "Product"
    );

    // --- BLOCK 2: Fetch related entities using private helpers ---
    const category = await this.getCategoryEntity(dto.categorySlug);
    const skills = await this.getSkillEntities(dto.skillSlugs);
    const educator = await this.getEducatorEntityByUserId(educatorId);

    // --- BLOCK 3: Create the entity instance ---
    const productToCreate = this.productRepo.create({
      ...dto, // Spread all properties from the DTO
      slug: slugify(dto.name), // Generate slug from name
      educator, // Assign the fetched Employer entity
      category, // Assign the fetched Category entity
      skills, // Assign the fetched Skill entities
      createdAt: new Date(), // Set creation date
      isActive: true, // Default to active
    });

    // --- BLOCK 4: Save the new product to the database
    const createdProduct = await this.productRepo.save(productToCreate);

    // --- BLOCK 5: Map Entities to DTOs ---
    const productDto = ProductDto.fromEntity(createdProduct);

    // --- BLOCK 6: Return Data ---
    return productDto;
  };

  // UPDATE a Product - restricted access for only admin
  updateProduct = async (
    slug: string,
    dto: UpdateProductDto,
    educatorId: string
  ): Promise<ProductDto> => {
    // --- BLOCK 1: Fetch Product with its jobs by slug and Handle Not Found ---
    const productToUpdate = await this.getProductEntity(slug, {
      category: true,
      skills: true,
      educator: true,
    });

    // --- BLOCK 2: Ownership check: Ensure the authenticated employer owns this job. ---
    // The employer relation on jobToUpdate should be loaded by getJobBySlug.
    if (productToUpdate.educator.id !== educatorId) {
      throw new AppError("Forbidden: You do not own this product.", 403); // Added 403 status
    }

    // --- BLOCK 3: Call the private method to get the entity ---
    const { name, shortDesc, longDesc } = dto;
    const fieldsToValidate: Record<string, string> = {};
    if (name !== undefined) fieldsToValidate.name = name;
    if (shortDesc !== undefined) fieldsToValidate.shortDesc = shortDesc;
    if (longDesc !== undefined) fieldsToValidate.longDesc = longDesc;
    checkForbiddenWords(fieldsToValidate, "Product");

    // --- BLOCK 4: Update Category if provided in DTO ---
    let category: Category = productToUpdate.category; // Default to existing category
    if (dto.categoryId && dto.categoryId !== productToUpdate.category.id) {
      category = await this.getCategoryEntity(dto.categoryId);
    }
    // If dto.categoryId is undefined or the same as existing, 'category' remains 'productToUpdate.category'

    // --- BLOCK 5: Update Skills if provided in DTO ---
    let skills = productToUpdate.skills; // Default to existing skills
    if (dto.skillIds !== undefined) {
      // Check if skillIds array is explicitly provided (even if empty)
      skills = await this.getSkillEntities(dto.skillIds);
    }

    // --- BLOCK 6: Apply scalar updates (only if property exists in DTO) ---
    Object.assign(productToUpdate, {
      name: dto.name,
      shortDesc: dto.shortDesc,
      longDesc: dto.longDesc,
      price: dto.price,
      // You might not want to allow updating isActive or postedAt directly via PUT
      // isActive: dto.isActive,
      // expiresAt: dto.expiresAt,
    });

    // Update slug if title changed
    if (dto.name && dto.name !== productToUpdate.name) {
      productToUpdate.slug = slugify(dto.name);
    }

    // --- BLOCK 7: Assign updated relations ---
    productToUpdate.category = category;
    productToUpdate.skills = skills;

    // --- BLOCK 8: Save the new product to the database
    const updatedProduct = await this.productRepo.save(productToUpdate);

    // --- BLOCK 8: Map Entities to DTOs ---
    const productDto = ProductDto.fromEntity(updatedProduct);

    // --- BLOCK 9: Return Data ---
    return productDto;
  };

  /**
   * Deletes a product posting.
   * @param slug The slug of the product to delete.
   * @param educatorId The ID of the authenticated educator.
   * @returns A promise resolving to void.
   */
  deleteProduct = async (slug: string, educatorId: string): Promise<void> => {
    // --- BLOCK 1: Call the private method to get the entity, ensuring 'curriculum' relation is loaded ---
    const productToDelete = await this.getProductEntity(slug, {
      educator: true,
      curriculum: true,
    });

    if (!productToDelete) throw new AppError("Product not found", 404);

    // --- BLOCK 2: Ownership check: Ensure the authenticated employer owns this job.
    if (productToDelete.educator.id !== educatorId)
      throw new AppError("Forbidden: You do not own this product.", 403);

    // --- BLOCK 3: Check if the skill has associated curriculum ---
    if (productToDelete.curriculum && productToDelete.curriculum.length > 0) {
      throw new AppError(
        "Cannot delete product: It has associated curriculum.",
        400
      ); // Or 409 Conflict
    }

    // --- BLOCK 4: Delete the product ---
    await this.productRepo.remove(productToDelete);
  };
}
