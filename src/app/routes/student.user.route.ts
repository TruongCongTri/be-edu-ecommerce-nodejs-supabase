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
import { UpdateStudentDetailDto } from "../../database/dtos/update-student-detail.dto";
import { authorizeMiddleware } from "../middlewares/authorize.middleware";
import { UserRole } from "../../../constants/enum";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const userService = new UserService(
  userRepository,
  educatorRepository,
  studentRepository
); // Pass repo to service
const userController = new UserController(userService); // Pass service to controller

router.get(
  "/me/profile",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.STUDENT]),
  asyncHandler(userController.getStudentProfile.bind(userController))
);


router.put(
  "/me/profile",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.STUDENT]),
  validateRequest(UpdateStudentDetailDto, "body"),
  asyncHandler(userController.updateProfile.bind(userController))
);


export default router;
