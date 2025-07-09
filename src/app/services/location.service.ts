import { locationRepository } from "../repositories/location.repository";
import { Location } from "../../database/entities/Location";

import { CreateLocationDto } from "../../database/dtos/CreateLocation.dto";
import { UpdateLocationDto } from "../../database/dtos/UpdateLocation.dto";

import { AppError } from "../../../utils/errors/AppError";
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

  /**
   * Private helper to fetch a Location entity by its code, including necessary relations for internal use.
   * Throws AppError if not found.
   * @param code The code of the location.
   * @param withRelations An optional object to specify relations to load.
   * @returns The Location entity.
   */
  private getLocationEntityByCode = async (
    code: string,
    withRelations?: { jobs?: boolean } // Define which relations can be loaded
  ): Promise<Location> => {
    // --- BLOCK 1: Fetch Location by code and Handle Not Found ---
    const location = await this.locationRepo.findOne({
      where: { code },
      relations: withRelations, // Dynamically load relations based on need
    });
    if (!location) {
      throw new AppError("Location not found", 404);
    }

    // --- BLOCK 2: Return the Location entity ---
    return location;
  };

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
  getLocationByCode = async (code: string): Promise<LocationOutputDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const location = await this.getLocationEntityByCode(code);

    // --- BLOCK 2: Map Entities to DTOs ---
    const locationDto = LocationOutputDto.fromEntity(location);

    // --- BLOCK 3: Return Data ---
    return locationDto;
  };
  // Get single Location with its jobs by slug - public access
  getLocationWithJobsByCode = async (
    code: string
  ): Promise<LocationOutputDto> => {
    // --- BLOCK 1: Call the private method to get the entity, ensuring 'jobs' relation is loaded ---
    const location = await this.getLocationEntityByCode(code, { jobs: true });

    // --- BLOCK 2: Map Entities to DTOs ---
    const locationDto = LocationOutputDto.fromEntity(location);

    // --- BLOCK 3: Return Data ---
    return locationDto;
  };

  // Create new Location - restricted access for only admin
  createLocation = async (
    dto: CreateLocationDto
  ): Promise<LocationOutputDto> => {
    // --- BLOCK 1: Perform content checks using the utility function ---
    checkForbiddenWords([dto.name, dto.code], "Location");

    // --- BLOCK 2: Manual check for unique name & code before attempting to save ---
    const existingName = await this.locationRepo.findOneBy({ name: dto.name });
    if (existingName) throw new AppError("Location already exists", 409);

    const existingCode = await this.locationRepo.findOneBy({ code: dto.code });
    if (existingCode)
      throw new AppError("Location with this code already exists", 409);

    // --- BLOCK 3: Create the entity instance ---
    const locationToCreate = this.locationRepo.create({
      ...dto,
    });

    // --- BLOCK 4: Save the new location to the database
    const createdLocation = await this.locationRepo.save(locationToCreate);

    // --- BLOCK 5: Map Entities to DTOs ---
    const locationDto = LocationOutputDto.fromEntity(createdLocation);

    // --- BLOCK 6: Return Data ---
    return locationDto;
  };
  // Update a Location - restricted access for only admin
  updateLocation = async (
    codeParam: string,
    dto: UpdateLocationDto
  ): Promise<LocationOutputDto> => {
    // --- BLOCK 1: Call the private method to get the entity ---
    const locationToUpdate = await this.getLocationEntityByCode(codeParam);

    // --- BLOCK 2: Destructure body Parameters ---
    const { name, code } = dto;

    // --- BLOCK 3: Perform content checks using the utility function ---
    const nameToCheck = name !== undefined ? name : locationToUpdate.name;
    const codeToCheck = code !== undefined ? code : locationToUpdate.code;
    checkForbiddenWords([nameToCheck, codeToCheck], "Location");

    // --- BLOCK 4: Check for unique name|code conflict ONLY if the name|code is actually changing
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

    // --- BLOCK 5: Merge DTO into the existing category entity
    this.locationRepo.merge(locationToUpdate, {
      ...dto,
    });

    // --- BLOCK 6: Save the new category to the database
    const updatedLocation = await this.locationRepo.save(locationToUpdate);

    // --- BLOCK 7: Map Entities to DTOs ---
    const locationDto = LocationOutputDto.fromEntity(updatedLocation);

    // --- BLOCK 8: Return Data ---
    return locationDto;
  };
  // Delete a Location - restricted access for only admin
  deleteLocation = async (code: string): Promise<void> => {
    // --- BLOCK 1: Call the private method to get the entity, ensuring 'jobs' relation is loaded ---
    const locationToDelete = await this.getLocationEntityByCode(code, { jobs: true });
    
    // --- BLOCK 2: Check if the skill has associated jobs ---
    if (locationToDelete.jobs && locationToDelete.jobs.length > 0) {
      throw new AppError(
        "Cannot delete location: It has associated jobs.",
        400
      ); // Or 409 Conflict
    }

    // --- BLOCK 3: Delete the skill ---
    await this.locationRepo.remove(locationToDelete);
  };
}
