import { locationRepository } from "../repositories/location.repository";
import { Location } from "../../database/entities/Location";

import { CreateLocationDto } from "../../database/dtos/CreateLocation.dto";
import { UpdateLocationDto } from "../../database/dtos/UpdateLocation.dto";

import { AppError } from "../../../utils/errors/AppError";

export class LocationService {
  private locationRepo = locationRepository;

  constructor() {}

  // Get all Locations - public access
  getAllLocations = async (): Promise<Location[]> => {
    return await this.locationRepo.find({ order: { createdAt: "DESC" } });
  }
  // Get single Location by slug - public access
  getLocationByCode = async (code: string): Promise<Location> => {
    const location = await this.locationRepo.findOne({
      where: { code },
    });
    if (!location) throw new AppError("Location not found", 404);
    return location;
  }
  // Get single Location with its jobs by slug - public access
  getLocationWithJobsByCode = async (code: string): Promise<Location> => {
    const location = await this.locationRepo.findOne({
      where: { code },
      relations: ["jobs"],
    });
    if (!location) throw new AppError("Location not found", 404);
    return location;
  }

  // Create new Location - restricted access for only admin
  createLocation = async (dto: CreateLocationDto): Promise<Location> => {
    const existingName = await this.locationRepo.findOneBy({ name: dto.name });
    if (existingName) throw new AppError("Location already exists", 409);

    const existingCode = await this.locationRepo.findOneBy({ code: dto.code });
    if (existingCode)
      throw new AppError("Location with this code already exists", 409);

    const locationToCreate = this.locationRepo.create({
      ...dto,
    });

    return await this.locationRepo.save(locationToCreate);
  };
  // Update a Location - restricted access for only admin
  updateLocation = async (
    codeParam: string,
    dto: UpdateLocationDto
  ): Promise<Location> => {
    const locationToUpdate = await this.getLocationByCode(codeParam);
    if (!locationToUpdate) throw new AppError("Location not found", 404);

    const { name, code } = dto;
    if (name !== locationToUpdate.name) {
      const existingName = await this.locationRepo.findOneBy({ name });
      if (existingName) throw new AppError("Location already exists", 409);
    }
    if (code !== locationToUpdate.code) {
      const existingCode = await this.locationRepo.findOneBy({ code });
      if (existingCode) throw new AppError("Location with this code already exists", 409);
    }
    locationToUpdate.name = name || locationToUpdate.name;
    locationToUpdate.code = code || locationToUpdate.code;
    // skill.slug = dto.name ? slugify(dto.name) : skill.slug;

    return await this.locationRepo.save(locationToUpdate);
  };
  // Delete a Location - restricted access for only admin
  deleteLocation = async (code: string): Promise<void> => {
    const locationToDelete = await this.getLocationByCode(code);
    if (!locationToDelete) throw new AppError("Location not found", 404);

    await this.locationRepo.remove(locationToDelete);
  };
}
