import { IsUUID } from 'class-validator';

export class RemoveViewHistoryDto {
  // @IsUUID()
  // userId!: string;

  @IsUUID()
  entryId!: string;
}
