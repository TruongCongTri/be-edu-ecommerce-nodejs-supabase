import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";
import { AppError } from "../../../utils/errors/AppError";

import { createPaginationMeta } from "../../../utils/helpers/pagination.helper";
import { buildQueryOptions } from "../../../utils/build-query-options";

import { ForbiddenWordDto } from "../../database/dtos/forbidden-word.dto";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { PaginationMetaDto } from "../../database/dtos/pagination-meta.dto";
import { CreateForbiddenWordDto } from "../../database/dtos/create-forbidden-word.dto";
import { UpdateForbiddenWordDto } from "../../database/dtos/update-forbidden-word.dto";

import { ForbiddenWord } from "../../database/entities/ForbiddenWord";

import { ForbiddenWordRepositoryType } from "../repositories/forbidden-word.repository";

export class ForbiddenWordService {
  private forbiddenWordsCache: string[] = [];

  private forbiddenWordRepo: ForbiddenWordRepositoryType;

  constructor(forbiddenWordRepo: ForbiddenWordRepositoryType) {
    this.forbiddenWordRepo = forbiddenWordRepo;
  }

  // Load all from DB into memory
  loadCache = async () => {
    const all = await this.forbiddenWordRepo.find();
    this.forbiddenWordsCache = all.map((o) => o.word);
    console.log("✅ Forbidden words loaded:", this.forbiddenWordsCache);
  };
  // Expose cache if needed
  getCache() {
    return this.forbiddenWordsCache;
  }
  // Used by the checkForbiddenWords helper
  isWordForbidden(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.forbiddenWordsCache.some((word) => lowerText.includes(word));
  }
  // Refresh cache after any DB change
  refreshCache = async () => {
    await this.loadCache();
  };

  // admin
  getAll = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    forbiddenWords: ForbiddenWordDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<ForbiddenWord>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["word"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [forbiddenWords, total] = await this.forbiddenWordRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const forbiddenWordDtos = forbiddenWords.map(ForbiddenWordDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      forbiddenWords: forbiddenWordDtos,
      pagination: paginationMeta,
    };
  };

  create = async (dto: CreateForbiddenWordDto): Promise<ForbiddenWordDto> => {
    // --- BLOCK 1: Manual check for unique origin before attempting to save ---
    const existing = await this.forbiddenWordRepo.findOneBy({
      word: dto.word,
    });
    if (existing) throw new AppError("Forbidden Word already exists", 409);

    // --- BLOCK 2: Create the entity instance ---
    const forbiddenWordToCreate = this.forbiddenWordRepo.create(dto);
    // --- BLOCK 3: Save the new allowed origin to the database
    const createdForbiddenWord = await this.forbiddenWordRepo.save(
      forbiddenWordToCreate
    );

    // --- BLOCK 4: Update in-memory ---
    this.loadCache();

    // --- BLOCK 5: Map Entities to DTOs ---
    const forbiddenWordDto = ForbiddenWordDto.fromEntity(createdForbiddenWord);

    // --- BLOCK 6: Return Data ---
    return forbiddenWordDto;
  };

  update = async (
    id: string,
    dto: UpdateForbiddenWordDto
  ): Promise<ForbiddenWordDto> => {
    // --- BLOCK 1: Fetch Forbidden word by id and Handle Not Found ---
    const forbiddenWordToUpdate = await this.forbiddenWordRepo.findOneBy({
      id,
    });
    if (!forbiddenWordToUpdate)
      throw new AppError("Forbidden word not found", 404);

    // --- BLOCK 2: Destructure body Parameters ---
    const { word } = dto;

    // --- BLOCK 3: Check for unique origin conflict ONLY if the origin is actually changing
    if (word !== undefined && word !== forbiddenWordToUpdate.word) {
      const existing = await this.forbiddenWordRepo.findOneBy({
        word,
      });
      if (existing) throw new AppError("Forbidden word already exists", 409);
    }

    // --- BLOCK 4: Merge DTO into the existing forbidden word entity
    this.forbiddenWordRepo.merge(forbiddenWordToUpdate, {
      ...dto,
    });

    // --- BLOCK 5: Save the updated forbidden word to the database
    const updatedForbiddenWord = await this.forbiddenWordRepo.save(
      forbiddenWordToUpdate
    );

    // --- BLOCK 6: Update in-memory ---
    await this.loadCache();

    // --- BLOCK 7: Map Entities to DTOs ---
    const forbiddenWordDto = ForbiddenWordDto.fromEntity(updatedForbiddenWord);

    // --- BLOCK 8: Return Data ---
    return forbiddenWordDto;
  };

  delete = async (id: string): Promise<void> => {
    // --- BLOCK 1: Fetch Forbidden word by slug and Handle Not Found ---
    const forbiddenWordToDelete = await this.forbiddenWordRepo.findOneBy({
      id,
    });
    if (!forbiddenWordToDelete)
      throw new AppError("Forbidden word not found", 404);

    // --- BLOCK 2: Delete the forbidden word ---
    await this.forbiddenWordRepo.remove(forbiddenWordToDelete);

    // --- BLOCK 3: Update in-memory ---
    await this.loadCache();
  };
}
