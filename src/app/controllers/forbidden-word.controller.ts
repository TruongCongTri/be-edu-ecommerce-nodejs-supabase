import { Request, Response } from "express";

import { successResponse } from "../../../utils/errors/responses/successResponse";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { ForbiddenWordService } from "../services/forbidden-word.service";

export class ForbiddenWordController {
  constructor(private forbiddenWordService: ForbiddenWordService) {}

  // GET /api/admin/forbidden-words
  getAllForbiddenWords = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { forbiddenWords, pagination } =
      await this.forbiddenWordService.getAll(queryParams);

    return successResponse({
      res,
      message: "List of Forbidden Words fetched successfully",
      data: { "forbidden-words": forbiddenWords },
      pagination: pagination,
    });
  };

  // POST /api/admin/forbidden-words/create
  createForbiddenWord = async (req: Request, res: Response) => {
    const createdForbiddenWord = await this.forbiddenWordService.create(req.body);

    return successResponse({
      res,
      message: "Forbidden Word created successfully",
      data: { "forbidden-words": createdForbiddenWord },
    });
  };

  // PUT /api/admin/forbidden-words/:id
  updateForbiddenWord = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedForbiddenWord = await this.forbiddenWordService.update(id, req.body);

    return successResponse({
      res,
      message: "Forbidden Word updated successfully",
      data: { "forbidden-words": updatedForbiddenWord },
    });
  };

  // DELETE /api/admin/forbidden-words/:id
  deleteForbiddenWord = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.forbiddenWordService.delete(id);

    return successResponse({
      res,
      message: "Forbidden Word deleted successfully",
    });
  };
}
