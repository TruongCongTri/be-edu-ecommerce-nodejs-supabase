import { Router } from "express";

import { JobController } from "../controllers/job.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validateRequest";
import { ValidateSlugDto } from "../../database/dtos/ValidateSlug.dto";
import { authenticateMiddleware } from "../middlewares/authenticateMiddleware";
import { authorizeMiddleware } from "../middlewares/authorizeMiddleware";
import { UserRole } from "../../../constants/enum";
import { CreateJobDto } from "../../database/dtos/CreateJob.dto";
import { UpdateJobDto } from "../../database/dtos/UpdateJob.dto";
import { JobFilterParams } from "../../database/dtos/JobFilterParams.dto";
import { JobService } from "../services/job.service";

import { jobRepository } from "../repositories/job.repository";
import { categoryRepository } from "../repositories/category.repository";
import { skillRepository } from "../repositories/skill.repository";
import { locationRepository } from "../repositories/location.repository";
import { employerRepository } from "../repositories/user.repository";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const jobService = new JobService(
  jobRepository,
  categoryRepository,
  skillRepository,
  locationRepository,
  employerRepository
); // Pass repo to service
const jobController = new JobController(jobService); // Pass service to controller

// 
router.get("/filter",
  validateRequest(JobFilterParams, "query"),
  asyncHandler(jobController.filterAllJobs)
);
router.get("/employer", 
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(JobFilterParams, "query"),
  asyncHandler(jobController.filterAllEmployerJobs)
);
// 
router.get("/", 
  asyncHandler(jobController.getAllJobs)
);
router.get("/details", 
  asyncHandler(jobController.getAllJobDetails)
);
//
router.get("/:slug",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(jobController.getJobBySlug)
);
router.get("/:slug/details",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(jobController.getJobDetailBySlug)
);
//
router.post("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(CreateJobDto, "body"),
  asyncHandler(jobController.createJob)
);
router.put("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(ValidateSlugDto, "params"),
  validateRequest(UpdateJobDto, "body"),
  // asyncHandler((req, res) => jobController.updateJob(req as any, res))
  asyncHandler(jobController.updateJob.bind(jobController))
);
router.delete("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(ValidateSlugDto, "params"),
  // asyncHandler((req, res) => jobController.deleteJob(req as any, res))
  asyncHandler(jobController.deleteJob.bind(jobController))
);

export default router;