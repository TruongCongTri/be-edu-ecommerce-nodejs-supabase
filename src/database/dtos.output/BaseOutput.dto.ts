import { Expose } from "class-transformer";

export abstract class BaseOutputDto<T> {
  @Expose()
  id!: string;

  static fromEntity<E, D extends BaseOutputDto<any>>(
    this: new (partial: Partial<D>) => D,
    entity: E
  ): D {
    return new this(entity as Partial<D>);
  }
}
