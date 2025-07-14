import { Router } from "express";

import { authenticateMiddleware } from "../middlewares/authenticate.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import { AuthController } from "../controllers/auth.controller";

// import { RegisterDto } from "../../database/dtos/Register.dto";
// import { ChangePasswordDto } from "../../database/dtos/ChangePassword.dto";

import { AuthService } from "../services/auth.service";
import { authRepository } from "../repositories/auth.repository";

import { CreateUserDto } from "../../database/dtos/create-user.dto";
import { LoginDto } from "../../database/dtos/Login.dto";
import { ChangePasswordDto } from "../../database/dtos/change-password.dto";

const router = Router();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

// Login
router.post("/login",
  validateRequest(LoginDto, "body"),
  asyncHandler(authController.login.bind(authController)) // Bind controller method for 'this' context
);

// Register - by default assumes student
router.post("/register",
  validateRequest(CreateUserDto, "body"),
  asyncHandler(authController.registerStudent.bind(authController))
);

// Register as educator
router.post("/educator/register",
  validateRequest(CreateUserDto, "body"),
  asyncHandler(authController.registerEducator.bind(authController))
);

// Register as Admin
router.post("/admin/register",
  validateRequest(CreateUserDto, "body"),
  asyncHandler(authController.registerAdmin.bind(authController))
);

// Change password (auth required)
router.post("/change-password",
  authenticateMiddleware,
  validateRequest(ChangePasswordDto, "body"),
  asyncHandler(authController.changePassword.bind(authController))
);

export default router;
