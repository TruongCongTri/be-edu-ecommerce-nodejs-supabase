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
import { UserService } from "../services/user.service";

import { skillRepository } from "../repositories/skill.repository";
import {
  userRepository,
  employerRepository,
  jobSeekerRepository,
} from "../repositories/user.repository";
import { UpdateUserDto } from "../../database/dtos/UpdateUser.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const userService = new UserService(
  userRepository,
  employerRepository,
  jobSeekerRepository,
  skillRepository
); // Pass repo to service
const userController = new UserController(userService); // Pass service to controller

// Profile
router.get(
  "/profile",
  authenticateMiddleware,
  asyncHandler(userController.getProfile.bind(userController))
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
    if (role === "admin") { // Explicitly apply UpdateUserDto for admin
      return validateRequest(UpdateUserDto, "body")(req, res, next);
    }
    return next();
  },
  asyncHandler(userController.updateProfile.bind(userController))
);

export default router;
