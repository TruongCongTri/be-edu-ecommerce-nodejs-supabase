import { IsUUID } from 'class-validator';

export class CreateViewHistoryDto {
  // @IsUUID()
  // userId!: string;

  @IsUUID()
  productId!: string;
}
