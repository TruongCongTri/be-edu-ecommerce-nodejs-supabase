import { Router } from "express";

import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { educatorRepository } from "../repositories/user.repository";
import { productRepository } from "../repositories/product.repository";
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