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

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const productService = new ProductService(
  productRepository,
  categoryRepository,
  skillRepository,
  educatorRepository
); // Pass repo to service
const productController = new ProductController(productService); // Pass service to controller

// Educator only: Get all educator's products
router.get("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EDUCATOR]),
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(productController.getAllProductsOfEducator)
);
// Educator only: Create new product
router.post("/create",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EDUCATOR]),
  validateRequest(CreateProductDto, "body"),
  asyncHandler(productController.createProduct.bind(productController))
);
// Educator only: Update product
router.put("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EDUCATOR]),
  validateRequest(ValidateSlugDto, "params"),
  validateRequest(UpdateProductDto, "body"),
  asyncHandler(productController.updateProduct.bind(productController))
);
// Educator only: Delete product
router.delete("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.EDUCATOR]),
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(productController.deleteProduct.bind(productController))
);

export default router;