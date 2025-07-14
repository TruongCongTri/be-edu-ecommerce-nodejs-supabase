import { PartialType } from "../../../utils/partial-type";
import { CreateSkillDto } from "./create-skill.dto";

export class UpdateSkillDto extends PartialType(CreateSkillDto) {}
