import { Request, Response } from "express";

import { successResponse } from "../../../utils/errors/responses/successResponse";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";
import { AuthenticatedRequest } from "../middlewares/authenticate.middleware";

import { ProductDetailService } from "../services/product-detail.service";
import { CreateProductDetailDto } from "../../database/dtos/create-product-detail.dto";
import { UpdateProductDetailDto } from "../../database/dtos/update-product-detail.dto";

export class ProductDetailController {
  constructor(private productDetailService: ProductDetailService) {}

  // GET /api/admin/products/details
  getAllProductDetails = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { productDetails, pagination } =
      await this.productDetailService.getAllProductDetails(queryParams);

    return successResponse({
      res,
      message: "List of Product details fetched successfully",
      data: { "product-details": productDetails },
      pagination: pagination,
    });
  };
  // GET /api/educator/products/:productSlug/details
  getEducatorProductDetails = async (
    req: AuthenticatedRequest<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;
    const { productSlug } = req.params;
    const educatorId = req.user!.id;

    const productDetails =
      await this.productDetailService.getEducatorProductDetails(
        productSlug,
        educatorId
      );

    return successResponse({
      res,
      message: "List of Product details fetched successfully",
      data: { "product-details": productDetails },
    });
  };
  // GET /api/products/:productSlug/details
  getProductDetailsPublic = async (req: Request, res: Response) => {
    // Extract the validated query parameters
    const queryParams = req.query;
    const { productSlug } = req.params;

    const productDetails =
      await this.productDetailService.getProductDetailsPublic(
        queryParams,
        productSlug
      );

    return successResponse({
      res,
      message: "List of Product details fetched successfully",
      data: { "product-details": productDetails },
    });
  };

  // GET /api/products/details/:detailSlug
  getProductDetailBySlug = async (req: Request, res: Response) => {
    const { detailSlug } = req.params;
    const productDetail =
      await this.productDetailService.getProductDetailBySlug(detailSlug);

    return successResponse({
      res,
      message: "Product detail fetched successfully",
      data: { "product-detail": productDetail },
    });
  };

  // POST /api/educator/products/:productSlug/details
  createProduct = async (
    req: AuthenticatedRequest<any, CreateProductDetailDto>,
    res: Response
  ) => {
    const { productSlug } = req.params;
    const dto = req.body;
    const educatorId = req.user!.id;

    const createdProduct = await this.productDetailService.createProductDetail(
      productSlug,
      educatorId,
      dto
    );

    return successResponse({
      res,
      statusCode: 201,
      message: "Product detail created successfully",
      data: { "product-detail": createdProduct },
    });
  };

  // PUT /api/educator/products/:productSlug/details/:detailSlug
  updateProduct = async (
    req: AuthenticatedRequest<
      { productSlug: string; detailSlug: string },
      {},
      UpdateProductDetailDto
    >,
    res: Response
  ) => {
    const { productSlug, detailSlug } = req.params;
    const educatorId = req.user!.id;
    const dto = req.body;

    const updatedProduct = await this.productDetailService.updateProduct(
      productSlug,
      detailSlug,
      educatorId,
      dto
    );

    return successResponse({
      res,
      message: "Product detail updated successfully",
      data: { "product-detail": updatedProduct },
    });
  };

  // DELETE /api/educator/products/:productSlug/details/:detailSlug
  deleteProduct = async (
    req: AuthenticatedRequest<{ productSlug: string; detailSlug: string }>,
    res: Response
  ) => {
    const { productSlug, detailSlug } = req.params;
    const educatorId = req.user!.id;

    await this.productDetailService.deleteProductDetail(
      productSlug,
      detailSlug,
      educatorId
    );

    return successResponse({
      res,
      message: "Product detail deleted successfully",
      statusCode: 204,
    });
  };
}
