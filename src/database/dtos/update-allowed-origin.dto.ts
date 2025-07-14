import { PartialType } from "../../../utils/partial-type";
import { CreateAllowedOriginDto } from "./create-allowed-origin.dto";

export class UpdateAllowedOriginDto extends PartialType(
  CreateAllowedOriginDto
) {}
