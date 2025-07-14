import { PartialType } from "../../../utils/partial-type";
import { CreateStudentDetailDto } from "./create-student-detail.dto";

export class UpdateStudentDetailDto extends PartialType(
  CreateStudentDetailDto
) {}
