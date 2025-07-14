import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSkillDto {
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  description?: string;
}
