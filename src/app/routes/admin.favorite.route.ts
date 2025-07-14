import { Router } from "express";

import { UserRole } from "../../../constants/enum";
import { FavoriteService } from "../services/favorite.service";

import { FavoriteController } from "../controllers/favorite.controller";

import { favoriteRepository } from "../repositories/favorite.repository";
import { userRepository } from "../repositories/user.repository";
import { productRepository } from "../repositories/product.repository";

import { authenticateMiddleware } from "../middlewares/authenticate.middleware";
import { authorizeMiddleware } from "../middlewares/authorize.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const favoriteService = new FavoriteService(
  favoriteRepository,
  userRepository,
  productRepository
); // Pass repo to service
const favoriteController = new FavoriteController(favoriteService); // Pass service to controller

// Admin only: Create new skill
router.post("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(BaseQueryParamsDto, "params"),
  asyncHandler(favoriteController.getAllFavorites)
);

export default router;
