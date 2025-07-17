import { PaginationMetaDto } from "../../database/dtos/pagination-meta.dto";

import { createPaginationMeta } from "../../../utils/helpers/pagination.helper";
import {
  EducatorRepositoryType,
  UserRepositoryType,
} from "../repositories/user.repository";
import { EducatorDetail } from "../../database/entities/EducatorDetail";
import { EducatorDto } from "../../database/dtos/educator.dto";
import { UserRole } from "../../../constants/enum";
import { AppError } from "../../../utils/errors/AppError";

export class EducatorService {
  private userRepo: UserRepositoryType;
  constructor(userRepo: UserRepositoryType) {
    this.userRepo = userRepo;
  }

  /**
   * Fetches the Category entity by unique slug.
   * Does NOT throw if not found, as category might need to be created.
   * @param slug The unique Slug of the associated category.
   * @param relations Optional relations to load (e.g., ['products']).
   * @returns The Category entity or null.
   */
  //   private async getEducatorEntity(
  //     id: string,
  //     relations?: { user?: boolean } // Define which relations can be loaded
  //   ): Promise<EducatorDetail | null> {
  //     const cate = await this.eduRepo.findOne({
  //       where: { id },
  //       relations: relations,
  //     });
  //     return cate;
  //   }

  // --- Public Methods (Exposed to Controllers) ---
  getEducators = async (): Promise<{
    educators: EducatorDto[];
    pagination: PaginationMetaDto;
  }> => {
    const qb = this.userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.educatorDetail", "educatorDetail")
      .where("user.role = :role", { role: UserRole.EDUCATOR })
      .orderBy("user.createdAt", "DESC");

    // --- BLOCK 3: Execute Database Query (findAndCount) ---

    const [educators, total] = await qb.getManyAndCount();
    // --- BLOCK 4: Map Entities to DTOs ---
    const eduDtos = educators.map(EducatorDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(1, total, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      educators: eduDtos,
      pagination: paginationMeta,
    };
  };

  // Get single Category by slug - public access
  getEducatorById = async (id: string): Promise<EducatorDto> => {
    const qb = this.userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.educatorDetail", "educatorDetail")
      .where("user.id = :id", { id: id })
      .andWhere("user.role = :role", { role: UserRole.EDUCATOR });
    // --- BLOCK 1: Call the private method to get the entity ---
    const educator = await qb.getOne();
    if (!educator) {
      throw new AppError("Educator not found", 404);
    }

    // --- BLOCK 2: Map Entities to DTOs ---
    const eduDto = EducatorDto.fromEntity(educator);

    // --- BLOCK 3: Return Data ---
    return eduDto;
  };
}
