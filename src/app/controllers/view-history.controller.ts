import { Request, Response } from "express";
import { SkillService } from "../services/skill.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { ViewHistoryService } from "../services/view-history.service";
import { AuthenticatedRequest } from "../middlewares/authenticate.middleware";
import { CreateViewHistoryDto } from "../../database/dtos/create-view-history.dto";
import { RemoveViewHistoryDto } from "../../database/dtos/remove-view-history.dto";

export class ViewHistoryController {
  constructor(private viewHistoryService: ViewHistoryService) {}

  // GET /api/admin/view-history
  getAllViewHistory = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { views, pagination } =
      await this.viewHistoryService.getAllViewHistory(queryParams);

    return successResponse({
      res,
      message: "List of View Histories fetched successfully",
      data: { "view-histories": views },
      pagination: pagination,
    });
  };

  // GET /api/users/me/view-history
  getUserViewHistory = async (
    req: AuthenticatedRequest<{}, {}, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;
    const userId = req.user!.id;

    const { views, pagination } =
      await this.viewHistoryService.getUserViewHistory(userId, queryParams);

    return successResponse({
      res,
      message: "List of View Histories fetched successfully",
      data: { "view-histories": views },
      pagination: pagination,
    });
  };

  // POST /api/users/me/view-history
  addViewHistory = async (
    req: AuthenticatedRequest<{}, {}, CreateViewHistoryDto>,
    res: Response
  ) => {
    const userId = req.user!.id;
    const productId = req.body.productId;

    const viewHistoryDto = await this.viewHistoryService.addViewHistory(
      userId,
      productId
    );

    return successResponse({
      res,
      message: "New view history created successfully",
      data: { "view-histories": viewHistoryDto },
    });
  };

  // DELETE /api/users/me/view-history
  removeUserViewHistoryEntry = async (
    req: AuthenticatedRequest<{ id: string }, {}, RemoveViewHistoryDto>,
    res: Response
  ) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await this.viewHistoryService.removeUserViewHistoryEntry(userId, id);

    return successResponse({
      res,
      message: "View history removed successfully",
      statusCode: 204,
    });
  };
}
