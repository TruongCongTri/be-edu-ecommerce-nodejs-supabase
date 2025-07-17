import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { ValidateSlugDto } from "../../database/dtos/validate-slug.dto";

import { skillRepository } from "../repositories/skill.repository";
import { educatorRepository } from "../repositories/user.repository";
import { categoryRepository } from "../repositories/category.repository";
import { productRepository } from "../repositories/product.repository";
import { ProductController } from "../controllers/product.controller";
import { ProductService } from "../services/product.service";
import { FilterProductQueryParamsDto } from "../../database/dtos/filter-product-query-params.dto";
import { validateFilterRequest } from "../middlewares/validate-fiter.middleware";
import { ValidateIdDto } from "../../database/dtos/validate-id.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const productService = new ProductService(
  productRepository,
  categoryRepository,
  skillRepository,
  educatorRepository
); // Pass repo to service
const productController = new ProductController(productService); // Pass service to controller

// Public access: Get all products
router.get("/filter", 
  validateFilterRequest(FilterProductQueryParamsDto, "query"),
  asyncHandler(productController.filterAllProducts)
);

router.get("/", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(productController.getAllProducts)
);

// Public access: Get single product
router.get("/:slug",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(productController.getProductBySlug)
);
// Public access: Get single product with its related data
router.get("/:slug/detail",
  asyncHandler(validateRequest(ValidateSlugDto, "params")),
  asyncHandler(productController.getProductWithRelatedDataBySlug)
);


router.get("/educator/:id",
  asyncHandler(validateRequest(ValidateIdDto, "params")),
  asyncHandler(productController.getProductWithRelatedDataBySlug)
);


export default router;