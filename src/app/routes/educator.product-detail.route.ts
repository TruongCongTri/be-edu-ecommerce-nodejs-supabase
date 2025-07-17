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

import { educatorRepository } from "../repositories/user.repository";
import { productRepository } from "../repositories/product.repository";

import { ProductDetailService } from "../services/product-detail.service";
import { productDetailRepository } from "../repositories/product-detail.repository";
import { ProductDetailController } from "../controllers/product-detail.controller";
import { ValidateProductAndDetailSlugDto } from "../../database/dtos/validate-product-detail-slug";
import { ValidateProductSlugDto } from "../../database/dtos/validate-product-slug";
import { CreateProductDetailDto } from "../../database/dtos/create-product-detail.dto";
import { UpdateProductDetailDto } from "../../database/dtos/update-product-detail.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const productDetailService = new ProductDetailService(
  productDetailRepository,
  productRepository,
  educatorRepository
); // Pass repo to service
const productDetailController = new ProductDetailController(productDetailService); // Pass service to controller

// Public access: Get all products
router.get("/:productSlug/details", 
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EDUCATOR]),
  validateRequest(ValidateProductSlugDto, "params"),
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(productDetailController.getEducatorProductDetails)
);

// Educator only: Create new product
router.post("/:productSlug/details",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EDUCATOR]),
  validateRequest(ValidateProductSlugDto, "params"),
  validateRequest(CreateProductDetailDto, "body"),
  asyncHandler(productDetailController.createProduct.bind(productDetailController))
);
// Educator only: Update product
router.put("/:productSlug/details/:detailSlug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EDUCATOR]),
  validateRequest(ValidateProductAndDetailSlugDto, "params"),
  validateRequest(UpdateProductDetailDto, "body"),
  asyncHandler(productDetailController.updateProduct.bind(productDetailController))
);
// Educator only: Delete product
router.delete("/:productSlug/details/:detailSlug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EDUCATOR]),
  validateRequest(ValidateProductAndDetailSlugDto, "params"),
  asyncHandler(productDetailController.deleteProduct.bind(productDetailController))
);

export default router;