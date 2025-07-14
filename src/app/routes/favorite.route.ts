import { Router } from "express";

import { FavoriteService } from "../services/favorite.service";

import { FavoriteController } from "../controllers/favorite.controller";

import { favoriteRepository } from "../repositories/favorite.repository";
import { userRepository } from "../repositories/user.repository";
import { productRepository } from "../repositories/product.repository";

import { authenticateMiddleware } from "../middlewares/authenticate.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";


import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { CreateFavoriteDto } from "../../database/dtos/create-favorite.dto";
import { RemoveFavoriteDto } from "../../database/dtos/remove-favorite.dto";
import { ValidateIdDto } from "../../database/dtos/validate-id.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const favoriteService = new FavoriteService(
  favoriteRepository,
  userRepository,
  productRepository
); // Pass repo to service
const favoriteController = new FavoriteController(favoriteService); // Pass service to controller

router.get("/", 
  authenticateMiddleware,
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(favoriteController.getUserFavorite)
);

router.post("/",
  authenticateMiddleware,
  validateRequest(CreateFavoriteDto, "body"),
  asyncHandler(favoriteController.addFavorite.bind(favoriteController))
);

router.delete("/:id",
  authenticateMiddleware,
  validateRequest(ValidateIdDto, "params"),
  asyncHandler(favoriteController.removeUserFavoriteEntry.bind(favoriteController))
);
export default router;