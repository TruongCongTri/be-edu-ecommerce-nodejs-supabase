import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { authenticateMiddleware } from "../middlewares/authenticateMiddleware";
import { authorizeMiddleware } from "../middlewares/authorizeMiddleware";
import { UserRole } from "../../../constants/enum";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validateRequest";
import { ValidateIdDto } from "../../database/dtos/ValidateId.dto";
import { CreateApplicationDto } from "../../database/dtos/CreateApplication.dto";
import { UpdateApplicationStatusDto } from "../../database/dtos/UpdateApplicationStatus.dto";
import { ApplicationService } from "../services/application.service";
import { applicationRepository } from "../repositories/application.repository";
import { jobRepository } from "../repositories/job.repository";
import {
  employerRepository,
  jobSeekerRepository,
} from "../repositories/user.repository";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { skillRepository } from "../repositories/skill.repository";
import { categoryRepository } from "../repositories/category.repository";
import { locationRepository } from "../repositories/location.repository";

const router = Router();
const appService = new ApplicationService(
  applicationRepository,
  jobRepository,
  jobSeekerRepository,
  employerRepository,
  skillRepository,
  categoryRepository,
  locationRepository
);
const appController = new ApplicationController(appService);

// job seeker routes
router.post("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.JOB_SEEKER]),
  validateRequest(CreateApplicationDto, "body"),
  asyncHandler(appController.createApplication.bind(appController))
);
router.get("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.JOB_SEEKER]),
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(appController.getMyApplicationsForJobSeeker.bind(appController))
);
router.get("id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.JOB_SEEKER]),
  validateRequest(ValidateIdDto, "params"),
  asyncHandler(appController.getApplicationDetailForJobSeeker.bind(appController))
);

// employer routes
router.get("/employer",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(appController.getMyApplicationsForEmployer.bind(appController))
);
router.get("/employer/job/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(ValidateIdDto, "params"),
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(appController.getApplicationsForJobForEmployer.bind(appController))
);
router.get("/employer/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(ValidateIdDto, "params"),
  asyncHandler(appController.getApplicationDetailForEmployer.bind(appController))
);
router.patch("/employer/:id/update",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(UpdateApplicationStatusDto, "body"),
  asyncHandler(appController.updateApplicationStatus.bind(appController))
);

export default router;
