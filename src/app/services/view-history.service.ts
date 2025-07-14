import { AppError } from "../../../utils/errors/AppError";

import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { PaginationMetaDto } from "../../database/dtos/pagination-meta.dto";

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";

import { createPaginationMeta } from "../../../utils/helpers/pagination.helper";
import { ViewHistoryRepositoryType } from "../repositories/view-history.repository";
import { UserRepositoryType } from "../repositories/user.repository";
import { ProductRepositoryType } from "../repositories/product.repository";
import { ViewHistoryDto } from "../../database/dtos/view-history.dto";

export class ViewHistoryService {
  private viewHistoryRepo: ViewHistoryRepositoryType;
  private userRepo: UserRepositoryType;
  private productRepo: ProductRepositoryType;

  constructor(
    viewHistoryRepo: ViewHistoryRepositoryType,
    userRepo: UserRepositoryType,
    productRepo: ProductRepositoryType
  ) {
    this.viewHistoryRepo = viewHistoryRepo;
    this.userRepo = userRepo;
    this.productRepo = productRepo;
  }

  // --- Public Methods (Exposed to Controllers) ---
  // --- ADMIN: View all view histories ---
  getAllViewHistory = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    views: ViewHistoryDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    // const findOptions = buildQueryOptions<ViewHistory>({
    //   queryParams,
    //   // Fields to search within if 'search' query param is provided
    //   searchFields: ["name", "description"],
    //   // Default order for the results
    //   defaultOrder: { viewedAt: "DESC" },
    // });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [skills, total] = await this.viewHistoryRepo.findAndCount({
      relations: ["user", "product"],
      order: { viewedAt: "DESC" },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const viewDtos = skills.map(ViewHistoryDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      views: viewDtos,
      pagination: paginationMeta,
    };
  };

  // --- USER: View their own view history ---
  getUserViewHistory = async (
    userId: string,
    queryParams: BaseQueryParamsDto
  ): Promise<{
    views: ViewHistoryDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    // const findOptions = buildQueryOptions<Skill>({
    //   queryParams,
    //   // Fields to search within if 'search' query param is provided
    //   searchFields: ["name", "description"],
    //   // Default order for the results
    //   defaultOrder: { createdAt: "DESC" },
    // });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [views, total] = await this.viewHistoryRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ["user", "product"],
      order: { viewedAt: "DESC" },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const viewDtos = views.map(ViewHistoryDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      views: viewDtos,
      pagination: paginationMeta,
    };
  };

  // --- USER: Add view history when viewing a product ---
  addViewHistory = async (
    userId: string,
    productId: string
  ): Promise<ViewHistoryDto> => {
    // --- BLOCK 1: Validate user exists ---
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);

    // --- BLOCK 2: Validate product exists ---
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new AppError("Product not found", 404);

    // --- BLOCK 3: Check if this user already viewed this product ---
    let existing = await this.viewHistoryRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
      relations: ["product"],
    });

    if (existing) {
      // update timestamp
      existing.viewedAt = new Date();
      await this.viewHistoryRepo.save(existing);

      return ViewHistoryDto.fromEntity(existing);
    }

    // --- Create new entry if not exists ---
    const newEntry = this.viewHistoryRepo.create({
      user,
      product,
    });

    // --- BLOCK 4: Save the new view history to the database
    const createdHistory = await this.viewHistoryRepo.save(newEntry);

    // --- BLOCK 5: Map Entities to DTOs ---
    const historyDto = ViewHistoryDto.fromEntity({
      ...createdHistory,
      product,
    });

    // --- BLOCK 6: Return Data ---
    return historyDto;
  };

  // --- USER: Remove a single entry from their history ---
  removeUserViewHistoryEntry = async (
    userId: string,
    entryId: string
  ): Promise<void> => {
    // --- BLOCK 1: Check it exists and belongs to user ---
    const entry = await this.viewHistoryRepo.findOne({
      where: { id: entryId },
      relations: ["user"],
    });

    if (!entry) throw new AppError("View history entry not found", 404);
    if (entry.user.id !== userId) throw new AppError("Forbidden", 403);

    await this.viewHistoryRepo.delete(entryId);
  };
}
