import { PartialType } from "../../../utils/partial-type";
import { CreateForbiddenWordDto } from "./create-forbidden-word.dto";

export class UpdateForbiddenWordDto extends PartialType(
  CreateForbiddenWordDto
) {}
