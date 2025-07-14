import { Request, Response } from "express";

import { successResponse } from "../../../utils/errors/responses/successResponse";

import { FavoriteService } from "../services/favorite.service";
import { AuthenticatedRequest } from "../middlewares/authenticate.middleware";

import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { CreateFavoriteDto } from "../../database/dtos/create-favorite.dto";
import { RemoveFavoriteDto } from "../../database/dtos/remove-favorite.dto";
import { ValidateIdDto } from "../../database/dtos/validate-id.dto";

export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  // GET /api/admin/favorites
  getAllFavorites = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { favorites, pagination } = await this.favoriteService.getAllFavorite(
      queryParams
    );

    return successResponse({
      res,
      message: "List of Favorites fetched successfully",
      data: { favorites },
      pagination: pagination,
    });
  };

  // GET /api/users/me/favorites
  getUserFavorite = async (
    req: AuthenticatedRequest<{}, {}, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;
    const userId = req.user!.id;

    const { favorites, pagination } =
      await this.favoriteService.getUserFavorite(userId, queryParams);

    return successResponse({
      res,
      message: "List of Favorites fetched successfully",
      data: { favorites: favorites },
      pagination: pagination,
    });
  };

  // POST /api/users/me/favorites
  addFavorite = async (
    req: AuthenticatedRequest<{}, {}, CreateFavoriteDto>,
    res: Response
  ) => {
    const userId = req.user!.id;
    const productId = req.body.productId;

    const { favorite, isNew } = await this.favoriteService.addFavorite(
      userId,
      productId
    );

    return successResponse({
      res,
      message: isNew
        ? "Product added to favorites"
        : "Product was already in your favorites",
      data: { favorite },
    });
  };

  // DELETE /api/users/me/favorites
  removeUserFavoriteEntry = async (
    req: AuthenticatedRequest<{ id: string }, RemoveFavoriteDto>,
    res: Response
  ) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await this.favoriteService.removeUserFavoriteEntry(userId, id);

    return successResponse({
      res,
      message: "Favorite removed successfully",
      statusCode: 204,
    });
  };
}
