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

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const productDetailService = new ProductDetailService(
  productDetailRepository,
  productRepository,
  educatorRepository
); // Pass repo to service
const productDetailController = new ProductDetailController(productDetailService); // Pass service to controller

// Public access: Get all products
router.get("/details", 
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(productDetailController.getAllProductDetails)
);

export default router;