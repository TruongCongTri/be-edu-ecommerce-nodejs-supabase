import { AppError } from "../../../utils/errors/AppError";

import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { PaginationMetaDto } from "../../database/dtos/pagination-meta.dto";

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";

import { createPaginationMeta } from "../../../utils/helpers/pagination.helper";
import { FavoriteRepositoryType } from "../repositories/favorite.repository";
import { UserRepositoryType } from "../repositories/user.repository";
import { ProductRepositoryType } from "../repositories/product.repository";
import { FavoriteDto } from "../../database/dtos/favorite.dto";

export class FavoriteService {
  private favoriteRepo: FavoriteRepositoryType;
  private userRepo: UserRepositoryType;
  private productRepo: ProductRepositoryType;

  constructor(
    favoriteRepo: FavoriteRepositoryType,
    userRepo: UserRepositoryType,
    productRepo: ProductRepositoryType
  ) {
    this.favoriteRepo = favoriteRepo;
    this.userRepo = userRepo;
    this.productRepo = productRepo;
  }

  // --- Public Methods (Exposed to Controllers) ---
  // --- ADMIN: View all view histories ---
  getAllFavorite = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    favorites: FavoriteDto[];
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
    const [skills, total] = await this.favoriteRepo.findAndCount({
      relations: ["user", "product"],
      order: { createdAt: "DESC" },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const favDtos = skills.map(FavoriteDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      favorites: favDtos,
      pagination: paginationMeta,
    };
  };

  // --- USER: View their own view history ---
  getUserFavorite = async (
    userId: string,
    queryParams: BaseQueryParamsDto
  ): Promise<{
    favorites: FavoriteDto[];
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
    const [views, total] = await this.favoriteRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ["user", "product"],
      order: { createdAt: "DESC" },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const favDtos = views.map(FavoriteDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      favorites: favDtos,
      pagination: paginationMeta,
    };
  };

  // --- USER: Add view history when viewing a product ---
  addFavorite = async (
    userId: string,
    productId: string
  ): Promise<{ favorite: FavoriteDto; isNew: boolean }> => {
    // --- BLOCK 1: Validate user exists ---
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new AppError("User not found", 404);

    // --- BLOCK 2: Validate product exists ---
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new AppError("Product not found", 404);

    // --- BLOCK 3: Check if this user already liked this product ---
    let existing = await this.favoriteRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
      relations: ["product"],
    });

    if (existing) {
      return {
        favorite: FavoriteDto.fromEntity(existing),
        isNew: false,
      };
    }

    // --- Create new entry if not exists ---
    const newEntry = this.favoriteRepo.create({
      user,
      product,
    });

    // --- BLOCK 4: Save the new favorite to the database
    const createdFav = await this.favoriteRepo.save(newEntry);

    // --- BLOCK 5: Map Entities to DTOs ---
    const favDto = FavoriteDto.fromEntity({
      ...createdFav,
      product,
    });

    // --- BLOCK 6: Return Data ---
    return {
    favorite: favDto,
    isNew: true
  };
  };

  // --- USER: Remove a single entry from their favorite ---
  removeUserFavoriteEntry = async (
    userId: string,
    entryId: string
  ): Promise<void> => {
    // --- BLOCK 1: Check it exists and belongs to user ---
    const entry = await this.favoriteRepo.findOne({
      where: { id: entryId },
      relations: ["user"],
    });

    if (!entry) throw new AppError("Favorite entry not found", 404);
    if (entry.user.id !== userId) throw new AppError("Forbidden", 403);

    await this.favoriteRepo.delete(entryId);
  };
}
