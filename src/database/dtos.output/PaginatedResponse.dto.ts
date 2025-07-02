import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto } from './PaginationMeta.dto'; // Import PaginationMetaDto

export class PaginatedResponseDto<T> {
  // @Expose() // Expose if you want the data key directly, often it's nested like { applications: [...] }
  // data: T[]; // The actual list of items

  @Expose()
  @Type(() => PaginationMetaDto) // Ensure nested DTO is transformed
  pagination: PaginationMetaDto;

  constructor(pagination: PaginationMetaDto) {
    // this.data = data; // Data will be added directly in the successResponse
    this.pagination = pagination;
  }
}