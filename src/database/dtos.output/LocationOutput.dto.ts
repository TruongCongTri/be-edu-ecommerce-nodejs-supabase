import { Expose, Type } from "class-transformer";
import { Location } from "../entities/Location";
import { JobPartialOutputDto } from "./JobPartialOutput.dto";

export class LocationOutputDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  code!: string;

  @Expose()
  @Type(() => JobPartialOutputDto)
  jobs?: JobPartialOutputDto[];

  constructor(partial: Partial<LocationOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(location: Location): LocationOutputDto {
    return new LocationOutputDto({
      id: location.id,
      name: location.name,
      code: location.code,
      jobs: location.jobs?.map(JobPartialOutputDto.fromEntity),
    });
  }
}
