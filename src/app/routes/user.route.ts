import { Router } from "express";

import {
  authenticateMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authenticateMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

import { validateRequest } from "../middlewares/validateRequest";

import { UpdateJobSeekerProfileDto } from "../../database/dtos/UpdateJobSeekerProfile.dto";
import { UpdateEmployerProfileDto } from "../../database/dtos/UpdateEmployerProfile.dto";

import { UserController } from "../controllers/user.controller";
import { UpdateJobSeekerDto } from "../../database/dtos/UpdateJobSeeker.dto";
import { UpdateEmployerDto } from "../../database/dtos/UpdateEmployer.dto";

const router = Router();
const userController = new UserController();

// Profile
router.get(
  "/profile",
  authenticateMiddleware,
  asyncHandler(userController.getProfile)
);

router.put(
  "/profile",
  authenticateMiddleware,
  (req: AuthenticatedRequest, res, next) => {
    const role = req.user!.role;
    if (role === "job_seeker")
      return validateRequest(UpdateJobSeekerDto, "body")(req, res, next);
    if (role === "employer")
      return validateRequest(UpdateEmployerDto, "body")(req, res, next);
    return next(); // admin can be validated manually
  },
  asyncHandler(userController.updateProfile)
);

export default router;
