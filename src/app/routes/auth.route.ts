import { Router } from "express";

import { authenticateMiddleware } from "../middlewares/authenticateMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validateRequest";

import { AuthController } from "../controllers/auth.controller";

import { RegisterDto } from "../../database/dtos/Register.dto";
import { LoginDto } from "../../database/dtos/Login.dto";
import { ChangePasswordDto } from "../../database/dtos/ChangePassword.dto";

const router = Router();
const authController = new AuthController();

// Login
router.post(
  "/login",
  validateRequest(LoginDto, "body"),
  asyncHandler(authController.login)
);

// Register - by default assumes job seeker
router.post(
  "/register",
  validateRequest(RegisterDto, "body"),
  asyncHandler(authController.registerJobSeeker)
);

// Register as employer
router.post(
  "/employer/register",
  validateRequest(RegisterDto, "body"),
  asyncHandler(authController.registerEmployer)
);

// Register as Admin
router.post(
  "/admin/register",
  validateRequest(RegisterDto, "body"),
  asyncHandler(authController.registerAdmin)
);

// Change password (auth required)
router.post(
  "/change-password",
  authenticateMiddleware,
  validateRequest(ChangePasswordDto, "body"),
  asyncHandler(authController.changePassword)
);

export default router;
