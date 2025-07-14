import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";
import { buildQueryOptions } from "../../../utils/build-query-options";
import { AppError } from "../../../utils/errors/AppError";
import { createPaginationMeta } from "../../../utils/helpers/pagination.helper";
import { AllowedOriginDto } from "../../database/dtos/allowed-origin.dto";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { CreateAllowedOriginDto } from "../../database/dtos/create-allowed-origin.dto";
import { PaginationMetaDto } from "../../database/dtos/pagination-meta.dto";
import { UpdateAllowedOriginDto } from "../../database/dtos/update-allowed-origin.dto";
import { AllowedOrigin } from "../../database/entities/AllowedOrigin";
import { AllowedOriginRepositoryType } from "../repositories/allowed-origin.repository";

export class AllowedOriginService {
  private allowedOriginsCache: string[] = [];

  private allowedOriginRepo: AllowedOriginRepositoryType;

  constructor(allowedOriginRepo: AllowedOriginRepositoryType) {
    this.allowedOriginRepo = allowedOriginRepo;
  }

  // Load all from DB into memory
  loadCache = async () => {
    const all = await this.allowedOriginRepo.find();
    this.allowedOriginsCache = all.map((o) => o.origin);
    console.log("✅ Allowed origins loaded:", this.allowedOriginsCache);
  }

  // Check if origin is allowed
  isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) return false;
    return this.allowedOriginsCache.includes(origin);
  }
  // Expose cache if needed
  getCache() {
    return this.allowedOriginsCache;
  }

  // Refresh cache after any DB change
  refreshCache = async () => {
    await this.loadCache();
  };

  
  getAll = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    allowedOrigin: AllowedOriginDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<AllowedOrigin>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["origin"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [allowedOrigins, total] = await this.allowedOriginRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const allowedOriginDtos = allowedOrigins.map(AllowedOriginDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      allowedOrigin: allowedOriginDtos,
      pagination: paginationMeta,
    };
  };

  create = async (dto: CreateAllowedOriginDto): Promise<AllowedOriginDto> => {
    // --- BLOCK 1: Manual check for unique origin before attempting to save ---
    const existing = await this.allowedOriginRepo.findOneBy({
      origin: dto.origin,
    });
    if (existing) throw new AppError("Origin already exists", 409);

    // --- BLOCK 2: Create the entity instance ---
    const originToCreate = this.allowedOriginRepo.create(dto);
    // --- BLOCK 3: Save the new allowed origin to the database
    const createdOrigin = await this.allowedOriginRepo.save(originToCreate);

    // --- BLOCK 4: Update in-memory ---
    await this.loadCache();

    // --- BLOCK 5: Map Entities to DTOs ---
    const allowedOriginDto = AllowedOriginDto.fromEntity(createdOrigin);

    // --- BLOCK 6: Return Data ---
    return allowedOriginDto;
  };

  update = async (
    id: string,
    dto: UpdateAllowedOriginDto
  ): Promise<AllowedOriginDto> => {
    // --- BLOCK 1: Fetch Allowed origin by slug and Handle Not Found ---
    const originToUpdate = await this.allowedOriginRepo.findOneBy({ id });
    if (!originToUpdate) throw new AppError("Origin not found", 404);

    // --- BLOCK 2: Destructure body Parameters ---
    const { origin } = dto;

    // --- BLOCK 3: Check for unique origin conflict ONLY if the origin is actually changing
    if (origin !== undefined && origin !== originToUpdate.origin) {
      const existing = await this.allowedOriginRepo.findOneBy({
        origin,
      });
      if (existing) throw new AppError("Origin already exists", 409);
    }

    // --- BLOCK 4: Merge DTO into the existing allowed origin entity
    this.allowedOriginRepo.merge(originToUpdate, {
      ...dto,
    });

    // --- BLOCK 5: Save the updated allowed origin to the database
    const updatedOrigin = await this.allowedOriginRepo.save(originToUpdate);

    // --- BLOCK 6: Update in-memory ---
    await this.loadCache();

    // --- BLOCK 7: Map Entities to DTOs ---
    const allowedOriginDto = AllowedOriginDto.fromEntity(updatedOrigin);

    // --- BLOCK 8: Return Data ---
    return allowedOriginDto;
  };

  delete = async (id: string): Promise<void> => {
    // --- BLOCK 1: Fetch Allowed origin by slug and Handle Not Found ---
    const originToDelete = await this.allowedOriginRepo.findOneBy({ id });
    if (!originToDelete) throw new AppError("Origin not found", 404);

    // --- BLOCK 2: Delete the skill ---
    await this.allowedOriginRepo.remove(originToDelete);

    // --- BLOCK 3: Update in-memory ---
    await this.loadCache();
  };


}
