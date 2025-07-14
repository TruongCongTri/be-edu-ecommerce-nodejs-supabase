import { IsUUID } from 'class-validator';

export class RemoveFavoriteDto {
  // @IsUUID()
  // userId!: string;

  @IsUUID()
  entryId!: string;
}
