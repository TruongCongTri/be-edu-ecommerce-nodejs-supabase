import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { instanceToPlain } from "class-transformer";
import { CategoryOutputDto } from "../../database/dtos.output/CategoryOutput.dto";
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

    // const categoryDtos = categories.map(CategoryOutputDto.fromEntity);
    // const plainData = instanceToPlain(categoryDtos);

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

    // const categoryDtos = categories.map(CategoryOutputDto.fromEntity);
    // const plainData = instanceToPlain(categoryDtos);

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

    const categoryDto = CategoryOutputDto.fromEntity(category);
    // const plainData = instanceToPlain(categoryDto);

    return successResponse({
      res,
      message: "Single Category",
      data: { category: categoryDto },
    });
  };
  // GET /api/categories/:slug/jobs
  getCategoryWithJobsBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await this.cateService.getCategoryWithJobsBySlug(slug);

    const categoryDto = CategoryOutputDto.fromEntity(category);
    // const plainData = instanceToPlain(categoryDto);

    return successResponse({
      res,
      message: "Single Category and its jobs",
      data: { category: categoryDto },
    });
  };

  // POST /api/categories
  createCategory = async (req: Request, res: Response) => {
    const category = await this.cateService.createCategory(req.body);

    const categoryDto = CategoryOutputDto.fromEntity(category);
    // const plainData = instanceToPlain(categoryDto);

    return successResponse({
      res,
      message: "Category created successfully",
      data: { category: categoryDto },
    });
  };

  // PUT /api/categories/:slug
  updateCategory = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await this.cateService.updateCategory(slug, req.body);

    const categoryDto = CategoryOutputDto.fromEntity(category);
    // const plainData = instanceToPlain(categoryDto);

    return successResponse({
      res,
      message: "Category updated successfully",
      data: { category: categoryDto },
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
