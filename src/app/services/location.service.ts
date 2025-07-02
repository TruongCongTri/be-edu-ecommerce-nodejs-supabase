import { locationRepository } from "../repositories/location.repository";
import { Location } from "../../database/entities/Location";

import { CreateLocationDto } from "../../database/dtos/CreateLocation.dto";
import { UpdateLocationDto } from "../../database/dtos/UpdateLocation.dto";

import { AppError } from "../../../utils/errors/AppError";
import { EntityNotFoundError } from "typeorm";
import { checkForbiddenWords } from "../../../utils/forbiddenWordsChecker";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { LocationOutputDto } from "../../database/dtos.output/LocationOutput.dto";
import { PaginationMetaDto } from "../../database/dtos.output/PaginationMeta.dto";
import { buildQueryOptions } from "../../../utils/buildQueryOptions";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../../../constants/enum";
import { createPaginationMeta } from "../../../utils/helpers/paginationHelper";

export class LocationService {
  // private locationRepo = locationRepository;
  // constructor() {}

  // Repo is injected via constructor
  constructor(private locationRepo = locationRepository) {}

  // Get all Locations - public access
  getAllLocations = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    locations: LocationOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<Location>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name", "code"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [categories, total] = await this.locationRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        // jobs: {
        //   employer: true,
        //   category: true,
        //   skills: true,
        //   locations: true,
        // },
      },
    });
    // --- BLOCK 4: Map Entities to DTOs ---
    const locationDtos = categories.map(LocationOutputDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    // const total_page = Math.ceil(total / per_page!); // Use non-null assertion for per_page
    // const paginationMeta = new PaginationMetaDto(
    //   page!, // Use non-null assertion for page
    //   per_page!, // Use non-null assertion for per_page
    //   total,
    //   total_page
    // );
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      locations: locationDtos,
      pagination: paginationMeta,
    };
  };
  // Get all Locations with their jobs - public access
  getAllLocationsWithJobs = async (
    queryParams: BaseQueryParamsDto
  ): Promise<{
    locations: LocationOutputDto[];
    pagination: PaginationMetaDto;
  }> => {
    // --- BLOCK 1: Destructure Query Parameters ---
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = queryParams; // Destructure page and per_page for calculations

    // --- BLOCK 2: Build Find Options ---
    const findOptions = buildQueryOptions<Location>({
      queryParams,
      // Fields to search within if 'search' query param is provided
      searchFields: ["name", "code"],
      // Default order for the results
      defaultOrder: { createdAt: "DESC" },
    });

    // --- BLOCK 3: Execute Database Query (findAndCount) ---
    const [categories, total] = await this.locationRepo.findAndCount({
      ...findOptions, // Spread the generated findOptions
      relations: {
        jobs: {
          employer: true,
          category: true,
          skills: true,
          locations: true,
        },
      },
    });

    // --- BLOCK 4: Map Entities to DTOs ---
    const locationDtos = categories.map(LocationOutputDto.fromEntity);

    // --- BLOCK 5: Calculate and Create Pagination Metadata ---
    const paginationMeta = createPaginationMeta(page!, per_page!, total);

    // --- BLOCK 6: Return Data and Pagination Metadata ---
    return {
      locations: locationDtos,
      pagination: paginationMeta,
    };
  };
  // Get single Location by slug - public access
  getLocationByCode = async (code: string): Promise<Location> => {
    try {
      const location = await this.locationRepo.findOneOrFail({
        where: { code },
      });
      return location;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new AppError(`Location with Code ${location} not found.`, 404);
      }
      throw error;
    }
  };
  // Get single Location with its jobs by slug - public access
  getLocationWithJobsByCode = async (code: string): Promise<Location> => {
    const location = await this.locationRepo.findOne({
      where: { code },
      relations: ["jobs"],
    });
    if (!location) throw new AppError("Location not found", 404);
    return location;
  };

  // Create new Location - restricted access for only admin
  createLocation = async (dto: CreateLocationDto): Promise<Location> => {
    // 1. Perform content checks using the utility function
    checkForbiddenWords([dto.name, dto.code], "Location");

    // 2. Manual check for unique name, code before attempting to save
    const existingName = await this.locationRepo.findOneBy({ name: dto.name });
    if (existingName) throw new AppError("Location already exists", 409);

    const existingCode = await this.locationRepo.findOneBy({ code: dto.code });
    if (existingCode)
      throw new AppError("Location with this code already exists", 409);

    // 3. Create the entity instance
    const locationToCreate = this.locationRepo.create({
      ...dto,
    });

    // 4. Save the new category to the database
    return await this.locationRepo.save(locationToCreate);
  };
  // Update a Location - restricted access for only admin
  updateLocation = async (
    codeParam: string,
    dto: UpdateLocationDto
  ): Promise<Location> => {
    // 1. Find the category to update by slug
    const locationToUpdate = await this.getLocationByCode(codeParam);
    if (!locationToUpdate) throw new AppError("Location not found", 404);

    const { name, code } = dto;
    // 2. Check for unique name, code conflict ONLY if the name is actually changing
    // This correctly avoids false positives if the name, code isn't being updated
    if (name !== locationToUpdate.name) {
      const existingName = await this.locationRepo.findOneBy({ name });
      if (existingName) throw new AppError("Location already exists", 409);
    }
    if (code !== locationToUpdate.code) {
      const existingCode = await this.locationRepo.findOneBy({ code });
      if (existingCode)
        throw new AppError("Location with this code already exists", 409);
    }

    // 3. Prepare texts for forbidden words check
    // This is correctly getting the *effective* name and code after considering DTO updates.
    const nameToCheck = name !== undefined ? name : locationToUpdate.name;
    const codeToCheck = code !== undefined ? code : locationToUpdate.code;
    checkForbiddenWords([nameToCheck, codeToCheck], "Location");

    // 4. Merge DTO into the existing location entity
    this.locationRepo.merge(locationToUpdate, {
      ...dto,
    });

    // 5. Save the updated location
    return await this.locationRepo.save(locationToUpdate);
  };
  // Delete a Location - restricted access for only admin
  deleteLocation = async (code: string): Promise<void> => {
    const locationToDelete = await this.getLocationWithJobsByCode(code);

    if (locationToDelete.jobs && locationToDelete.jobs.length > 0) {
      throw new AppError(
        "Cannot delete location: It has associated jobs.",
        400
      ); // Or 409 Conflict
    }

    await this.locationRepo.remove(locationToDelete);
  };
}
