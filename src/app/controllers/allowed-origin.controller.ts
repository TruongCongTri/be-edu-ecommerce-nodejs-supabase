import { Request, Response } from "express";
import { SkillService } from "../services/skill.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { AllowedOriginService } from "../services/allowed-origin.service";

export class AllowedOriginController {
  constructor(private allowedOriginService: AllowedOriginService) {}

  // GET /api/admin/allowed-origins
  getAllAllowedOrigins = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { allowedOrigin, pagination } =
      await this.allowedOriginService.getAll(queryParams);

    return successResponse({
      res,
      message: "List of Allowed Origins fetched successfully",
      data: { "allowed-origins": allowedOrigin },
      pagination: pagination,
    });
  };

  // POST /api/admin/allowed-origins/create
  createAllowedOrigin = async (req: Request, res: Response) => {
    const createdAllowedOrigin = await this.allowedOriginService.create(req.body);

    return successResponse({
      res,
      message: "Allowed Origin created successfully",
      data: { "allowed-origin": createdAllowedOrigin },
    });
  };

  // PUT /api/admin/allowed-origins/:id
  updateAllowedOrigin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedAllowedOrigin = await this.allowedOriginService.update(id, req.body);

    return successResponse({
      res,
      message: "Allowed Origin updated successfully",
      data: { "allowed-origin": updatedAllowedOrigin },
    });
  };

  // DELETE /api/admin/allowed-origins/:id
  deleteAllowedOrigin = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.allowedOriginService.delete(id);

    return successResponse({
      res,
      message: "Allowed Origin deleted successfully",
    });
  };
}
