import { Router } from "express";

import { authenticateMiddleware } from "../middlewares/authenticateMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validateRequest";

import { AuthController } from "../controllers/auth.controller";

import { RegisterDto } from "../../database/dtos/Register.dto";
import { LoginDto } from "../../database/dtos/Login.dto";
import { ChangePasswordDto } from "../../database/dtos/ChangePassword.dto";
import { AuthService } from "../services/auth.service";
import { authRepository } from "../repositories/auth.repository";

const router = Router();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

// Login
router.post("/login",
  validateRequest(LoginDto, "body"),
  asyncHandler(authController.login.bind(authController)) // Bind controller method for 'this' context
);

// Register - by default assumes job seeker
router.post("/register",
  validateRequest(RegisterDto, "body"),
  asyncHandler(authController.registerJobSeeker.bind(authController))
);

// Register as employer
router.post("/employer/register",
  validateRequest(RegisterDto, "body"),
  asyncHandler(authController.registerEmployer.bind(authController))
);

// Register as Admin
router.post("/admin/register",
  validateRequest(RegisterDto, "body"),
  asyncHandler(authController.registerAdmin.bind(authController))
);

// Change password (auth required)
router.post("/change-password",
  authenticateMiddleware,
  validateRequest(ChangePasswordDto, "body"),
  asyncHandler(authController.changePassword.bind(authController))
);

export default router;
