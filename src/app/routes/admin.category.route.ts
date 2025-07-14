import { Router } from "express";
import {
  authenticateMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authenticate.middleware";
import { authorizeMiddleware } from "../middlewares/authorize.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";


import { ValidateSlugDto } from "../../database/dtos/validate-slug.dto";
import { CreateCategoryDto } from "../../database/dtos/create-category.dto";
import { UpdateCategoryDto } from "../../database/dtos/update-category.dto";

import { UserRole } from "../../../constants/enum";

import { CategoryController } from "../controllers/category.controller";
import { CategoryService } from "../services/category.service";
import { categoryRepository } from "../repositories/category.repository";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const categoryService = new CategoryService(categoryRepository); // Pass repo to service
const categoryController = new CategoryController(categoryService); // Pass service to controller

// Admin only: Create new category
router.post("/create",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(CreateCategoryDto, "body"),
  asyncHandler(categoryController.createCategory.bind(categoryController))
);
// Admin only: Update category
router.put("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateSlugDto, "params"),
  validateRequest(UpdateCategoryDto, "body"),
  asyncHandler(categoryController.updateCategory.bind(categoryController))
);
// Admin only: Delete category
router.delete("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(categoryController.deleteCategory.bind(categoryController))
);

export default router;