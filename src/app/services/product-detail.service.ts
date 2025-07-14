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
import { ProductDetailRepositoryType } from "../repositories/product-detail.repository";
import { ProductDetail } from "../../database/entities/ProductDetail";
import { ProductDetailDto } from "../../database/dtos/product-detail.dto";
import { CreateProductDetailDto } from "../../database/dtos/create-product-detail.dto";

export class ProductDetailService {
  private productDetailRepo: ProductDetailRepositoryType;
  private productRepo: ProductRepositoryType;
  private educatorRepo: EducatorRepositoryType;

  // Constructor now accepts repositories as arguments
  // This is where DI happens!
  constructor(
    productDetailRepo: ProductDetailRepositoryType,
    productRepo: ProductRepositoryType,
    educatorRepo: EducatorRepositoryType
  ) {
    this.productDetailRepo = productDetailRepo;
    this.productRepo = productRepo;
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
    id: string,
    relations?: {
      category?: boolean;
      skills?: boolean;
      educator?: boolean;
      curriculum?: boolean;
    } // Define which relations can be loaded
  ): Promise<Product> {
    const productToFind = await this.productRepo.findOne({
      where: { id },
      relations: relations,
    });

    if (!productToFind) throw new AppError("Product not found", 404);

    return productToFind;
  }
  private async getProductDetailEntity(slug: string): Promise<ProductDetail> {
    const productDetailToFind = await this.productDetailRepo.findOne({
      where: { slug },
    });

    if (!productDetailToFind)
      throw new AppError("Product detail not found", 404);

    return productDetailToFind;
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
  // Helper: check educator owns product
  private async getOwnedProduct(
    productSlug: string,
    educatorId: string
  ): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug: productSlug },
      relations: ["educator"],
    });
    if (!product) throw new AppError("Product not found", 404);
    if (product.educator?.id !== educatorId) {
      throw new AppError(
        "You do not have permission to manage this product",
        403
      );
    }
    return product;
  }

  // --- Public Methods (Exposed to Controllers) ---
  // READ products

  // 1. Public: anyone can view details of a product
  getProductDetailsPublic = async (
    queryParams: BaseQueryParamsDto,
    productSlug: string
  ): Promise<ProductDetailDto[]> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<ProductDetail>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["title", "content"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 4: Execute Database Query (findAndCount) ---
    const product = await this.productRepo.findOne({
      where: { slug: productSlug },
      relations: ["curriculum"],
    });
    if (!product) throw new AppError("Product not found", 404);
    // --- BLOCK 4: Map Entities to DTOs ---
    const productDetailDtos = product.curriculum.map(
      ProductDetailDto.fromEntity
    );

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return productDetailDtos;
  };
  // 2. Educator: list details of *their* product
  getEducatorProductDetails = async (
    productSlug: string,
    educatorId: string
  ): Promise<ProductDetailDto[]> => {
    const product = await this.getOwnedProduct(productSlug, educatorId);

    await this.productRepo.findOneOrFail({
      where: { slug: productSlug, educator: { id: educatorId } },
      relations: ["curriculum"],
    });

    return product.curriculum.map(ProductDetailDto.fromEntity);
  };
  // 3. Admin: list all details
  getAllProductDetails = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    productDetails: ProductDetailDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<ProductDetail>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["title", "content"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [products, total] = await this.productDetailRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const productDetailDtos = products.map(ProductDetailDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      productDetails: productDetailDtos,
      pagination: paginationMeta,
    };
  };
  // get all product details of educator --- educator only
  getAllProductDetailsOfEducator = async (
    queryParams: BaseQueryParamsDto,
    educatorId: string
  ): Promise<{
    productDetails: ProductDetailDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<ProductDetail>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["title", "content"],
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
    const [products, total] = await this.productDetailRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      where,
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const productDetailDtos = products.map(ProductDetailDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      productDetails: productDetailDtos,
      pagination: paginationMeta,
    };
  };

  // Get single product by slug - public access
  getProductDetailBySlug = async (slug: string): Promise<ProductDetailDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const productDetailToFind = await this.getProductDetailEntity(slug);

    // --- BLOCK 2: Map Entities to DTOs ---
    const prodDto = ProductDetailDto.fromEntity(productDetailToFind);

    // --- BLOCK 3: Return Data ---
    return prodDto;
  };

  // CREATE new Product - restricted access for only admin
  createProductDetail = async (
    dto: CreateProductDetailDto,
    productSlug: string,
    educatorId: string
  ): Promise<ProductDetailDto> => {
    const product = await this.getOwnedProduct(productSlug, educatorId);

    // --- BLOCK 1:  ---
    checkForbiddenWords(
      { name: dto.title, shortDesc: dto.content },
      "Product Detail"
    );

    // --- BLOCK 4: Create the entity instance ---
    const productDetailToCreate = this.productDetailRepo.create({
      ...dto, // Spread all properties from the DTO
      product,
      educator: product.educator,
      slug: slugify(dto.title), // Generate slug from name
      createdAt: new Date(), // Set creation date
    });

    // --- BLOCK 5: Save the new product to the database
    const createdProductDetail = await this.productDetailRepo.save(
      productDetailToCreate
    );

    // --- BLOCK 6: Map Entities to DTOs ---
    const productDetailDto = ProductDetailDto.fromEntity(createdProductDetail);

    // --- BLOCK 7: Return Data ---
    return productDetailDto;
  };

  // UPDATE a Product - restricted access for only admin
  updateProduct = async (
    productSlug: string,
    detailSlug: string,
    educatorId: string,
    dto: UpdateProductDto
  ): Promise<ProductDetailDto> => {
    const product = await this.getOwnedProduct(productSlug, educatorId);

    // --- BLOCK 1: Fetch Product detail by slug and Handle Not Found ---
    const productDetailToUpdate = await this.productDetailRepo.findOne({
      where: { slug: detailSlug, product: { id: product.id } },
    });
    if (!productDetailToUpdate)
      throw new AppError("Product detail not found", 404);

    // --- BLOCK 3:  ---
    const { title, content } = dto;
    const fieldsToValidate: Record<string, string> = {};
    if (title !== undefined) fieldsToValidate.title = title;
    if (content !== undefined) fieldsToValidate.content = content;
    checkForbiddenWords(fieldsToValidate, "Product Detail");

    // --- BLOCK 6: Apply scalar updates (only if property exists in DTO) ---
    Object.assign(productDetailToUpdate, {
      title: dto.title,
      content: dto.content,
      // You might not want to allow updating isActive or postedAt directly via PUT
      // isActive: dto.isActive,
      // expiresAt: dto.expiresAt,
    });

    // Update slug if title changed
    if (dto.title && dto.title !== productDetailToUpdate.title) {
      productDetailToUpdate.slug = slugify(dto.title);
    }

    // --- BLOCK 8: Save the new product to the database
    const updatedProductDetail = await this.productDetailRepo.save(
      productDetailToUpdate
    );

    // --- BLOCK 8: Map Entities to DTOs ---
    const productDetailDto = ProductDetailDto.fromEntity(updatedProductDetail);

    // --- BLOCK 9: Return Data ---
    return productDetailDto;
  };

  /**
   * Deletes a product posting.
   * @param slug The slug of the product to delete.
   * @param educatorId The ID of the authenticated educator.
   * @returns A promise resolving to void.
   */
  deleteProductDetail = async (
    productSlug: string,
    detailSlug: string,
    educatorId: string
  ): Promise<void> => {
    const product = await this.getOwnedProduct(productSlug, educatorId);

    // --- BLOCK 1: Call the private method to get the entity, ensuring 'curriculum' relation is loaded ---
    const productDetailToDelete = await this.productDetailRepo.findOne({
      where: { slug: detailSlug, product: { id: product.id } },
    });
    if (!productDetailToDelete) throw new AppError("Product detail not found", 404);

    // --- BLOCK 2: Ownership check: Ensure the authenticated employer owns this job.

    // --- BLOCK 3: Delete the product ---
    await this.productDetailRepo.remove(productDetailToDelete);
  };
}
