import { categoryRepository } from "../repositories/category.repository";

import { CreateCategoryDto } from "../../database/dtos/CreateCategory.dto";
import { UpdateCategoryDto } from "../../database/dtos/UpdateCategory.dto";

import { Category } from "../../database/entities/Category";

import { slugify } from "../../../utils/helpers/slugify";
import { AppError } from "../../../utils/errors/AppError";
import { checkForbiddenWords } from "../../../utils/forbiddenWordsChecker";
import { EntityNotFoundError } from "typeorm";


export class CategoryService {
  private cateRepo = categoryRepository;

  constructor() {}

  // Get all category - public access
  getAllCategories = async (): Promise<Category[]> => {
    return await this.cateRepo.find({ order: { createdAt: "DESC" } });
  };
  // Get single category by slug - public access
  getCategoryBySlug = async (slug: string): Promise<Category> => {
    try {
      const cate = await this.cateRepo.findOneOrFail({
        where: { slug },
      });
      return cate;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new AppError(`Category with Slug ${slug} not found.`, 404);
      }
      throw error;
    }
    
  };
  // Get single category with its jobs by slug - public access
  getCategoryWithJobsBySlug = async (slug: string): Promise<Category> => {
    const cate = await this.cateRepo.findOne({
      where: { slug },
      relations: ["jobs"],
    });
    if (!cate) throw new AppError("Category not found", 404);
    return cate;
  };

  // Create new category - restricted access for only admin
  createCategory = async (dto: CreateCategoryDto): Promise<Category> => {
    // 1. Perform content checks using the utility function
    checkForbiddenWords([dto.name, dto.description || ''], 'Category');

    // 2. If all checks pass, proceed with database operation
    const existing = await this.cateRepo.findOneBy({ name: dto.name });
    if (existing) throw new AppError("Category already exists", 409);

    const cateToCreate = this.cateRepo.create({
      ...dto,
      slug: slugify(dto.name),
    });

    return await this.cateRepo.save(cateToCreate);
  };
  // Update a category - restricted access for only admin
  updateCategory = async (
    slug: string,
    dto: UpdateCategoryDto
  ): Promise<Category> => {
    // 1. Find the category to update by slug
    // Assuming getCategoryBySlug handles the 404 if not found internally,
    // or returns null/undefined which is then checked here.
    const cateToUpdate = await this.getCategoryBySlug(slug);
    if (!cateToUpdate) throw new AppError("Category not found", 404);

    const { name, description } = dto;
    // 2. Check for unique name conflict ONLY if the name is actually changing
    // This is good: avoids unnecessary DB lookup if name isn't updated
    if (name !== cateToUpdate.name) { // Ensure 'name' is provided in DTO AND it's different
      const existing = await this.cateRepo.findOneBy({ name });
      if (existing) throw new AppError("Category already exists", 409); // Business logic error: Category name already exists
    }

    // 3. Prepare texts for forbidden words check
    // This is correctly getting the *effective* name and description after considering DTO updates.
    const nameToCheck = name !== undefined ? name : cateToUpdate.name;
    const descriptionToCheck = description !== undefined ? description : cateToUpdate.description;
    // The `|| ''` for descriptionToCheck handles cases where description might be null/undefined initially,
    // ensuring checkForbiddenWords always receives a string.
    checkForbiddenWords([nameToCheck, descriptionToCheck || ''], 'Category');
    
    // 4. Merge DTO into the existing category entity
    // This correctly applies only the fields present in dto.
    this.cateRepo.merge(cateToUpdate, dto);

    // 5. Save the updated category
    // This will trigger the database unique constraint check as a final safeguard
    // if a race condition occurred between the findOneBy and save.
    return await this.cateRepo.save(cateToUpdate);
  };
  // Delete a category - restricted access for only admin
  deleteCategory = async (slug: string): Promise<void> => {
    const cateToDelete = await this.getCategoryBySlug(slug);
    if (!cateToDelete) throw new AppError("Category not found", 404);

    await this.cateRepo.remove(cateToDelete);
  };
}
