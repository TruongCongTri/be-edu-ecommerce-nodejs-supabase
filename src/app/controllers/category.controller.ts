import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";

export class CategoryController {
  constructor(private cateService: CategoryService) {}

  getCategories = async (
    req: Request,
    res: Response
  ) => {

    const { categories, pagination } = await this.cateService.getCategories();

    return successResponse({
      res,
      message: "List of Categories fetched successfully",
      data: { categories: categories },
      pagination: pagination,
    });
  };
  // GET /api/categories
  getAllCategories = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { categories, pagination } = await this.cateService.getAllCategories(queryParams);

    return successResponse({
      res,
      message: "List of Categories fetched successfully",
      data: { categories: categories },
      pagination: pagination,
    });
  };
  // GET /api/categories/products
  getAllCategoriesWithProducts = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { categories, pagination } = await this.cateService.getAllCategoriesWithProducts(queryParams);

    return successResponse({
      res,
      message: "List of Categories and their jobs fetched successfully",
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
      message: "Category fetched successfully",
      data: { category: category },
    });
  };
  // GET /api/categories/:slug/jobs
  getCategoryWithProductsBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const cateWithJobs = await this.cateService.getCategoryWithProductsBySlug(slug);

    return successResponse({
      res,
      message: "Category and its jobs fetched successfully",
      data: { category: cateWithJobs },
    });
  };

  // POST /api/categories/create
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
  deleteCategory = async (req: Request, res: Response) => {
    const { slug } = req.params;
    await this.cateService.deleteCategory(slug);

    return successResponse({
      res,
      message: "Category deleted successfully",
    });
  };
}
