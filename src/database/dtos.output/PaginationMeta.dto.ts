import { Expose, Type } from 'class-transformer';

export class PaginationMetaDto {
  @Expose()
  @Type(() => Number) 
  current_page: number;

  @Expose()
  @Type(() => Number) 
  per_page: number;

  @Expose()
  @Type(() => Number) 
  total: number; // Total number of items across all pages

  @Expose()
  @Type(() => Number) 
  total_page: number; // Total number of pages

  constructor(
    current_page: number,
    per_page: number,
    total: number,
    total_page: number
  ) {
    this.current_page = current_page;
    this.per_page = per_page;
    this.total = total;
    this.total_page = total_page;
  }
}