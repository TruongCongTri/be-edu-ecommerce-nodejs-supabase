import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { instanceToPlain } from "class-transformer";
import { CategoryOutputDto } from "../../database/dtos.output/CategoryOutput.dto";

export class CategoryController {
  private cateService = new CategoryService();

  constructor() {}

  // GET /api/categories
  getAllCategories = async (req: Request, res: Response) => {
    const categories = await this.cateService.getAllCategories();

    const categoryDtos = categories.map(CategoryOutputDto.fromEntity);
    const plainData = instanceToPlain(categoryDtos);

    return successResponse({
      res,
      message: "List of Categories",
      data: { categories: plainData },
    });
  };
  // GET /api/categories/:slug
  getCategoryBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await this.cateService.getCategoryBySlug(slug);

    const categoryDto = CategoryOutputDto.fromEntity(category);
    const plainData = instanceToPlain(categoryDto);

    return successResponse({
      res,
      message: "Single Category",
      data: { category: plainData },
    });
  };
  // GET /api/categories/:slug/jobs
  getCategoryWithJobsBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await this.cateService.getCategoryWithJobsBySlug(slug);

    const categoryDto = CategoryOutputDto.fromEntity(category);
    const plainData = instanceToPlain(categoryDto);

    return successResponse({
      res,
      message: "Single Category and its jobs",
      data: { category: plainData },
    });
  };

  // POST /api/categories
  createCategory = async (req: Request, res: Response) => {
    const category = await this.cateService.createCategory(req.body);

    const categoryDto = CategoryOutputDto.fromEntity(category);
    const plainData = instanceToPlain(categoryDto);

    return successResponse({
      res,
      message: "Category created successfully",
      data: { category: plainData },
    });
  };

  // PUT /api/categories/:slug
  updateCategory = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await this.cateService.updateCategory(slug, req.body);

    const categoryDto = CategoryOutputDto.fromEntity(category);
    const plainData = instanceToPlain(categoryDto);

    return successResponse({
      res,
      message: "Category updated successfully",
      data: { category: plainData },
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
