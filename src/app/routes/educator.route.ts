import { Router } from "express";

import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { ValidateSlugDto } from "../../database/dtos/validate-slug.dto";

import { SkillController } from "../controllers/skill.controller";
import { SkillService } from "../services/skill.service";
import { skillRepository } from "../repositories/skill.repository";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { EducatorService } from "../services/educator.service";
import { userRepository } from "../repositories/user.repository";
import { EducatorController } from "../controllers/educator.controller";
import { ValidateIdDto } from "../../database/dtos/validate-id.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const eduService = new EducatorService(userRepository); // Pass repo to service
const eduController = new EducatorController(eduService); // Pass service to controller

// Public access: Get all skills
router.get("/all", 
  asyncHandler(eduController.getEducators)
);
// Public access: Get single skill
router.get("/:id",
  validateRequest(ValidateIdDto, "params"),
  asyncHandler(eduController.getEducatorById)
);



export default router;