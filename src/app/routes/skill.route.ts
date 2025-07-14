import { Router } from "express";

import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { ValidateSlugDto } from "../../database/dtos/validate-slug.dto";

import { SkillController } from "../controllers/skill.controller";
import { SkillService } from "../services/skill.service";
import { skillRepository } from "../repositories/skill.repository";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const skillService = new SkillService(skillRepository); // Pass repo to service
const skillController = new SkillController(skillService); // Pass service to controller

// Public access: Get all skills
router.get("/", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(skillController.getAllSkills)
);
// Public access: Get all skills with their products
router.get("/products", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(skillController.getAllSkillsWithProducts)
);
// Public access: Get single skill
router.get("/:slug",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(skillController.getSkillBySlug)
);
// Public access: Get single skill with its products
router.get("/:slug/products",
  asyncHandler(validateRequest(ValidateSlugDto, "params")),
  asyncHandler(skillController.getSkillWithProductsBySlug)
);


export default router;