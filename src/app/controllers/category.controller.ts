import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";

export class CategoryController {
  // private cateService = new CategoryService();
  // constructor() {}

  // Service is injected via constructor
  constructor(private cateService: CategoryService) {}

  // GET /api/categories
  getAllCategories = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { categories, pagination } = await this.cateService.getAllCategories(queryParams);

    // Pass the DTO instances directly. successResponse will handle instanceToPlain.
    return successResponse({
      res,
      message: "List of Categories",
      data: { categories: categories },
      pagination: pagination,
    });
  };
  // GET /api/categories/jobs
  getAllCategoriesWithJobs = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { categories, pagination } = await this.cateService.getAllCategoriesWithJobs(queryParams);

    // Pass the DTO instances directly. successResponse will handle instanceToPlain.
    return successResponse({
      res,
      message: "List of Categories with their jobs",
      data: { categories: categories },
      pagination: pagination,
    });
  };

  // GET /api/categories/:slug
  getCategoryBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await this.cateService.getCategoryBySlug(slug);

    return successResponse({
      res,
      message: "Single Category",
      data: { category: category },
    });
  };
  // GET /api/categories/:slug/jobs
  getCategoryWithJobsBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const categoryWithJobs = await this.cateService.getCategoryWithJobsBySlug(slug);

    return successResponse({
      res,
      message: "Single Category and its jobs",
      data: { category: categoryWithJobs },
    });
  };

  // POST /api/categories
  createCategory = async (req: Request, res: Response) => {
    const createdCategory = await this.cateService.createCategory(req.body);

    return successResponse({
      res,
      message: "Category created successfully",
      data: { category: createdCategory },
    });
  };

  // PUT /api/categories/:slug
  updateCategory = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const updatedCategory = await this.cateService.updateCategory(slug, req.body);

    return successResponse({
      res,
      message: "Category updated successfully",
      data: { category: updatedCategory },
    });
  };

  // DELETE /api/categories/:slug
  async deleteCategory(req: Request, res: Response) {
    const { slug } = req.params;
    await this.cateService.deleteCategory(slug);

    return successResponse({
      res,
      message: "Category deleted successfully",
    });
  }
}
