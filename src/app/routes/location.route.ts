import { Router } from "express";
import { authenticateMiddleware } from "../middlewares/authenticateMiddleware";
import { authorizeMiddleware } from "../middlewares/authorizeMiddleware";

import { validateRequest } from "../middlewares/validateRequest";

import { asyncHandler } from "../middlewares/asyncHandler";

import { ValidateCodeDto } from "../../database/dtos/ValidateCode.dto";
import { CreateLocationDto } from "../../database/dtos/CreateLocation.dto";
import { UpdateLocationDto } from "../../database/dtos/UpdateLocation.dto";

import { UserRole } from "../../../constants/enum";

import { LocationController } from "../controllers/location.controller";
import { LocationService } from "../services/location.service";
import { locationRepository } from "../repositories/location.repository";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const locationService = new LocationService(locationRepository); // Pass repo to service
const locationController = new LocationController(locationService); // Pass service to controller

// Public access: Get all locations
router.get("/", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(locationController.getAllLocations)
);
// Public access: Get all locations with their jobs
router.get("/jobs", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(locationController.getAllLocationsWithJobs)
);
// Public access: Get single location
router.get("/:code",
  validateRequest(ValidateCodeDto, "params"),
  asyncHandler(locationController.getLocationBySlug)
);
// Public access: Get single location with its jobs
router.get("/:code/jobs",
  validateRequest(ValidateCodeDto, "params"),
  asyncHandler(locationController.getLocationWithJobsBySlug)
);

// Admin only: Create new location
router.post("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(CreateLocationDto, "body"),
  asyncHandler(locationController.createLocation)
);
// Admin only: Update location
router.put("/:code",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateCodeDto, "params"),
  validateRequest(UpdateLocationDto, "body"),
  asyncHandler(locationController.updateLocation)
);
// Admin only: Delete location
router.delete("/:code",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateCodeDto, "params"),
  asyncHandler(locationController.deleteLocation)
);

export default router;