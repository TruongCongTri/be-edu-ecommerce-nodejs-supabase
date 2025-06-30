import { Router } from "express";
import { authenticateMiddleware } from "../middlewares/authenticateMiddleware";
import { authorizeMiddleware } from "../middlewares/authorizeMiddleware";

import { validateRequest } from "../middlewares/validateRequest";

import { asyncHandler } from "../middlewares/asyncHandler";

import { ValidateSlugDto } from "../../database/dtos/ValidateSlug.dto";
import { CreateCategoryDto } from "../../database/dtos/CreateCategory.dto";
import { UpdateCategoryDto } from "../../database/dtos/UpdateCategory.dto";

import { UserRole } from "../../../constants/enum";

import { CategoryController } from "../controllers/category.controller";

const router = Router();
const cateController = new CategoryController();

// Public access: Get all categories
router.get("/", 
  asyncHandler(cateController.getAllCategories)
);
// Public access: Get single category
router.get("/:slug",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(cateController.getCategoryBySlug)
);
// Public access: Get single category with its jobs
router.get("/:slug/jobs",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(cateController.getCategoryWithJobsBySlug)
);

// Admin only: Create new category
router.post("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(CreateCategoryDto, "body"),
  asyncHandler(cateController.createCategory.bind(cateController))
);
// Admin only: Update category
router.put("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateSlugDto, "params"),
  validateRequest(UpdateCategoryDto, "body"),
  asyncHandler(cateController.updateCategory.bind(cateController))
);
// Admin only: Delete category
router.delete("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(cateController.deleteCategory.bind(cateController))
);

export default router;