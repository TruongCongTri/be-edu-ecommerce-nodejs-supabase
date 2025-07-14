import { Expose } from "class-transformer";
import { ForbiddenWord } from "../entities/ForbiddenWord";

export class ForbiddenWordDto {
  @Expose()
  id!: string;

  @Expose()
  word!: string;

  @Expose()
  createdAt!: Date;
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<ForbiddenWordDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(forbiddenWord: ForbiddenWord): ForbiddenWordDto {
    return new ForbiddenWordDto({
      id: forbiddenWord.id,
      word: forbiddenWord.word,
      createdAt: forbiddenWord.createdAt,
      updatedAt: forbiddenWord.updatedAt,
    });
  }
}
