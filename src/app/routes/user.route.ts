import { Router } from "express";

import {
  authenticateMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authenticate.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { validateRequest } from "../middlewares/validate-request.middleware";

import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";

import {
  userRepository,
  educatorRepository,
  studentRepository,
} from "../repositories/user.repository";
import { UpdateUserDto } from "../../database/dtos/UpdateUser.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const userService = new UserService(
  userRepository,
  educatorRepository,
  studentRepository
); // Pass repo to service
const userController = new UserController(userService); // Pass service to controller

// Profile
router.get(
  "/me/profile",
  authenticateMiddleware,
  asyncHandler(userController.getProfile.bind(userController))
);

router.put(
  "/me/profile",
  authenticateMiddleware,
  validateRequest(UpdateUserDto, "body"),
  asyncHandler(userController.updateProfile.bind(userController))
);

export default router;
