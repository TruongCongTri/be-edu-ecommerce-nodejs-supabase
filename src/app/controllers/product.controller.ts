import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { AuthenticatedRequest } from "../middlewares/authenticate.middleware";
import { CreateProductDto } from "../../database/dtos/create-product.dto";
import { UpdateProductDto } from "../../database/dtos/update-product.dto";

export class ProductController {
  constructor(private productService: ProductService) {}

  // GET /api/products
  getAllProducts = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { products, pagination } = await this.productService.getAllProducts(
      queryParams
    );

    return successResponse({
      res,
      message: "List of Products fetched successfully",
      data: { products: products },
      pagination: pagination,
    });
  };
  // GET /api/products/educator
  getAllProductsOfEducator = async (
    req: AuthenticatedRequest<{}, {}, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;
    const educatorId = req.user!.id;

    const { products, pagination } = await this.productService.getAllProductsOfEducator(
      queryParams,
      educatorId
    );

    return successResponse({
      res,
      message: "List of Products fetched successfully",
      data: { products: products },
      pagination: pagination,
    });
  };
  // GET /api/products/:slug
  getProductBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const product = await this.productService.getProductBySlug(slug);

    return successResponse({
      res,
      message: "Product fetched successfully",
      data: { product: product },
    });
  };
  // GET /api/products/:slug/detail
  getProductWithRelatedDataBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const product = await this.productService.getProductWithRelatedDataBySlug(
      slug
    );

    return successResponse({
      res,
      message: "Product and its related data fetched successfully",
      data: { product: product },
    });
  };

  // POST /api/products/educator/create
  createProduct = async (
    req: AuthenticatedRequest<{}, {}, CreateProductDto>,
    res: Response
  ) => {
    const educatorId = req.user!.id;

    const createdProduct = await this.productService.createProduct(
      req.body,
      educatorId
    );

    return successResponse({
      res,
      statusCode: 201,
      message: "Product created successfully",
      data: { product: createdProduct },
    });
  };

  // PUT /api/products/educator/:slug
  updateProduct = async (
    req: AuthenticatedRequest<{ slug: string }, {}, UpdateProductDto>,
    res: Response
  ) => {
    const { slug } = req.params;
    const educatorId = req.user!.id;

    const updatedProduct = await this.productService.updateProduct(
      slug,
      req.body,
      educatorId
    );

    return successResponse({
      res,
      message: "Product updated successfully",
      data: { product: updatedProduct },
    });
  };

  // DELETE /api/products/educator/:slug
  deleteProduct = async (
    req: AuthenticatedRequest<{ slug: string }>,
    res: Response
  ) => {
    const { slug } = req.params;
    const educatorId = req.user!.id;

    await this.productService.deleteProduct(slug, educatorId);

    return successResponse({
      res,
      message: "Product deleted successfully",
      statusCode: 204,
    });
  };
}
