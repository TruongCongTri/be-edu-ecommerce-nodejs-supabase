import { Request, Response } from "express";
import { LocationService } from "../services/location.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { instanceToPlain } from "class-transformer";
import { LocationOutputDto } from "../../database/dtos.output/LocationOutput.dto";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";

export class LocationController {
  // private locationService = new LocationService();
  // constructor() {}

  // Service is injected via constructor
  constructor(private locationService: LocationService) {}

  // GET /api/locations
  getAllLocations = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { locations, pagination } = await this.locationService.getAllLocations(queryParams);

    // const locationDtos = locations.map(LocationOutputDto.fromEntity);
    // const plainData = instanceToPlain(locationDtos);

    return successResponse({
      res,
      message: "List of locations",
      data: { locations: locations },
      pagination: pagination,
    });
  };
  // GET /api/locations/jobs
  getAllLocationsWithJobs = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { locations, pagination } = await this.locationService.getAllLocationsWithJobs(queryParams);

    // const locationDtos = locations.map(LocationOutputDto.fromEntity);
    // const plainData = instanceToPlain(locationDtos);

    return successResponse({
      res,
      message: "List of locations",
      data: { locations: locations },
      pagination: pagination,
    });
  };
  // GET /api/locations/:code
  getLocationBySlug = async (req: Request, res: Response) => {
    const { code } = req.params;
    const location = await this.locationService.getLocationByCode(code);

    const locationDto = LocationOutputDto.fromEntity(location);
    // const plainData = instanceToPlain(locationDto);

    return successResponse({
      res,
      message: "Single Location",
      data: { location: locationDto },
    });
  };
  // GET /api/locations/:code/jobs
  getLocationWithJobsBySlug = async (req: Request, res: Response) => {
    const { code } = req.params;
    const location = await this.locationService.getLocationWithJobsByCode(code);

    const locationDto = LocationOutputDto.fromEntity(location);
    // const plainData = instanceToPlain(locationDto);

    return successResponse({
      res,
      message: "Single Location and its jobs",
      data: { location: locationDto },
    });
  };

  // POST /api/locations
  createLocation = async (req: Request, res: Response) => {
    const location = await this.locationService.createLocation(req.body);

    const locationDto = LocationOutputDto.fromEntity(location);
    // const plainData = instanceToPlain(locationDto);

    return successResponse({
      res,
      message: "Location created successfully",
      data: { location: locationDto },
    });
  };

  // PUT /api/locations/:code
  updateLocation = async (req: Request, res: Response) => {
    const { code } = req.params;

    const location = await this.locationService.updateLocation(code, req.body);

    const locationDto = LocationOutputDto.fromEntity(location);
    // const plainData = instanceToPlain(locationDto);

    return successResponse({
      res,
      message: "Location updated successfully",
      data: { location: locationDto },
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
