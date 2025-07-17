import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { EducatorService } from "../services/educator.service";

export class EducatorController {
  constructor(private eduService: EducatorService) {}

  getEducators = async (req: Request, res: Response) => {
    const { educators, pagination } = await this.eduService.getEducators();

    return successResponse({
      res,
      message: "List of Educators fetched successfully",
      data: { educators: educators },
      pagination: pagination,
    });
  };

  // GET /api/educators/:id
  getEducatorById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const educator = await this.eduService.getEducatorById(id);

    return successResponse({
      res,
      message: "Educator fetched successfully",
      data: { educator: educator },
    });
  };
}
