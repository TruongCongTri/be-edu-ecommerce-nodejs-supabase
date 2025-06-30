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

const router = Router();
const jobController = new JobController();


router.get("/filter",
  validateRequest(JobFilterParams, "query"),
  asyncHandler(jobController.filterAllJobs)
);

router.get("/", 
  asyncHandler(jobController.getAllJobs)
);
router.get("/employer", 
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(JobFilterParams, "query"),
  asyncHandler(jobController.getAllEmployerJobs)
);
router.get("/details", 
  asyncHandler(jobController.getAllJobDetails)
);
router.get("/:slug",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(jobController.getJobBySlug)
);
router.get("/:slug/details",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(jobController.getJobDetailBySlug)
);

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
  asyncHandler((req, res) => jobController.updateJob(req as any, res))
);
router.delete("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler((req, res) => jobController.deleteJob(req as any, res))
);

export default router;