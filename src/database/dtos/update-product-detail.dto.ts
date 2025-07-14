import { PartialType } from "../../../utils/partial-type";
import { CreateProductDetailDto } from "./create-product-detail.dto";

export class UpdateProductDetailDto extends PartialType(
  CreateProductDetailDto
) {}
