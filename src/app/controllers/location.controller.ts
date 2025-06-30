import { Request, Response } from "express";
import { LocationService } from "../services/location.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { instanceToPlain } from "class-transformer";
import { LocationOutputDto } from "../../database/dtos.output/LocationOutput.dto";

export class LocationController {
  private locationService = new LocationService();

  constructor() {}

  // GET /api/locations
  getAllLocations = async (req: Request, res: Response) => {
    const locations = await this.locationService.getAllLocations();

    const locationDtos = locations.map(LocationOutputDto.fromEntity);
    const plainData = instanceToPlain(locationDtos);

    return successResponse({
      res,
      message: "List of locations",
      data: { locations: plainData },
    });
  };
  // GET /api/locations/:code
  getLocationBySlug = async (req: Request, res: Response) => {
    const { code } = req.params;
    const location = await this.locationService.getLocationByCode(code);

    const locationDto = LocationOutputDto.fromEntity(location);
    const plainData = instanceToPlain(locationDto);

    return successResponse({
      res,
      message: "Single Location",
      data: { location: plainData },
    });
  };
  // GET /api/locations/:code/jobs
  getLocationWithJobsBySlug = async (req: Request, res: Response) => {
    const { code } = req.params;
    const location = await this.locationService.getLocationWithJobsByCode(code);

    const locationDto = LocationOutputDto.fromEntity(location);
    const plainData = instanceToPlain(locationDto);

    return successResponse({
      res,
      message: "Single Location and its jobs",
      data: { location: plainData },
    });
  };

  // POST /api/locations
  createLocation = async (req: Request, res: Response) => {
    const location = await this.locationService.createLocation(req.body);

    const locationDto = LocationOutputDto.fromEntity(location);
    const plainData = instanceToPlain(locationDto);

    return successResponse({
      res,
      message: "Location created successfully",
      data: { location: plainData },
    });
  };

  // PUT /api/locations/:code
  updateLocation = async (req: Request, res: Response) => {
    const { code } = req.params;

    const location = await this.locationService.updateLocation(code, req.body);

    const locationDto = LocationOutputDto.fromEntity(location);
    const plainData = instanceToPlain(locationDto);

    return successResponse({
      res,
      message: "Location updated successfully",
      data: { location: plainData },
    });
  };

  // DELETE /api/locations/:code
  deleteLocation = async (req: Request, res: Response) => {
    const { code } = req.params;

    await this.locationService.deleteLocation(code);

    return successResponse({
      res,
      message: "Location deleted successfully",
    });
  };
}
