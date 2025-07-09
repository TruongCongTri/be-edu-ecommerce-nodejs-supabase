import { Request, Response } from "express";
import { LocationService } from "../services/location.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
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

    return successResponse({
      res,
      message: "Single Location",
      data: { location: location },
    });
  };
  // GET /api/locations/:code/jobs
  getLocationWithJobsBySlug = async (req: Request, res: Response) => {
    const { code } = req.params;
    const locationWithJobs = await this.locationService.getLocationWithJobsByCode(code);

    return successResponse({
      res,
      message: "Single Location and its jobs",
      data: { location: locationWithJobs },
    });
  };

  // POST /api/locations
  createLocation = async (req: Request, res: Response) => {
    const createdLocation = await this.locationService.createLocation(req.body);

    return successResponse({
      res,
      message: "Location created successfully",
      data: { location: createdLocation },
    });
  };

  // PUT /api/locations/:code
  updateLocation = async (req: Request, res: Response) => {
    const { code } = req.params;

    const updatedLocation = await this.locationService.updateLocation(code, req.body);

    return successResponse({
      res,
      message: "Location updated successfully",
      data: { location: updatedLocation },
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
