import { Router } from "express";
import {
  authenticateMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authenticate.middleware";
import { authorizeMiddleware } from "../middlewares/authorize.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { UserRole } from "../../../constants/enum";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { CreateProductDto } from "../../database/dtos/create-product.dto";
import { UpdateProductDto } from "../../database/dtos/update-product.dto";
import { ValidateSlugDto } from "../../database/dtos/validate-slug.dto";

import { skillRepository } from "../repositories/skill.repository";
import { educatorRepository } from "../repositories/user.repository";
import { categoryRepository } from "../repositories/category.repository";
import { productRepository } from "../repositories/product.repository";
import { ProductController } from "../controllers/product.controller";
import { ProductService } from "../services/product.service";
import { ProductDetailService } from "../services/product-detail.service";
import { productDetailRepository } from "../repositories/product-detail.repository";
import { ProductDetailController } from "../controllers/product-detail.controller";
import { ValidateProductSlugDto } from "../../database/dtos/validate-product-slug";
import { ValidateDetailSlugDto } from "../../database/dtos/validate-detail-slug";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const productDetailService = new ProductDetailService(
  productDetailRepository,
  productRepository,
  educatorRepository
); // Pass repo to service
const productDetailController = new ProductDetailController(productDetailService); // Pass service to controller


// Public access: Get single product
router.get("/:productSlug/details",
  validateRequest(ValidateProductSlugDto, "params"),
  asyncHandler(productDetailController.getProductDetailsPublic)
);
// Public access: Get single product with its related data
router.get("/details/:detailSlug",
  validateRequest(ValidateDetailSlugDto, "params"),
  asyncHandler(productDetailController.getProductDetailBySlug)
);

export default router;