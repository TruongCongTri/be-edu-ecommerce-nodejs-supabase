import { Router } from "express";

import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { ValidateSlugDto } from "../../database/dtos/validate-slug.dto";

import { CategoryController } from "../controllers/category.controller";
import { CategoryService } from "../services/category.service";
import { categoryRepository } from "../repositories/category.repository";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const categoryService = new CategoryService(categoryRepository); // Pass repo to service
const categoryController = new CategoryController(categoryService); // Pass service to controller

// Public access: Get all categories
router.get("/", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(categoryController.getAllCategories)
);
router.get("/all", 
  asyncHandler(categoryController.getCategories)
);
// Public access: Get all categories with their products
router.get("/products", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(categoryController.getAllCategoriesWithProducts)
);
// Public access: Get single category
router.get("/:slug",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(categoryController.getCategoryBySlug)
);
// Public access: Get single category with its products
router.get("/:slug/products",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(categoryController.getCategoryWithProductsBySlug)
);

export default router;