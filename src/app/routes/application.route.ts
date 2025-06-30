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

const router = Router();
const appController = new ApplicationController();

router.post("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.JOB_SEEKER]),
  validateRequest(CreateApplicationDto, "body"),
  asyncHandler(appController.createApplication)
)

router.get("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.JOB_SEEKER]),
  asyncHandler(appController.getMyApplicationsForJobSeeker)
);
router.get("/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.JOB_SEEKER]),
  validateRequest(ValidateIdDto, "params"),
  asyncHandler((req, res) => appController.getApplicationDetailForJobSeeker(req as any, res))
);

router.get("/employer",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  asyncHandler((req, res) => appController.getMyApplicationsForEmployer(req as any, res))
);

router.get("/employer/job/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(ValidateIdDto, "params"),
  asyncHandler((req, res) => appController.getApplicationsForJob(req as any, res))
);

router.get("/employer/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(ValidateIdDto, "params"),
  asyncHandler((req, res) => appController.getApplicationDetailForEmployer(req as any, res))
);

router.patch("/employer/:id/update",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EMPLOYER]),
  validateRequest(UpdateApplicationStatusDto, "body"),
  asyncHandler((req, res) => appController.updateApplicationStatus(req as any, res))
);

export default router;