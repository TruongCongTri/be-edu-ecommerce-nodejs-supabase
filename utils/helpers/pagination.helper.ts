// src/utils/paginationHelpers.ts
import { PaginationMetaDto } from '../../src/database/dtos.output/PaginationMeta.dto'; // Adjust path if needed

/**
 * Creates pagination metadata.
 * @param page The current page number.
 * @param perPage The number of items per page.
 * @param totalItems The total number of items.
 * @returns A PaginationMetaDto object.
 */
export function createPaginationMeta(
  page: number,
  perPage: number,
  totalItems: number
): PaginationMetaDto {
  const totalPages = Math.ceil(totalItems / perPage);
  return new PaginationMetaDto(page, perPage, totalItems, totalPages);
}