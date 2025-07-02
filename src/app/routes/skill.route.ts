import { Router } from "express";
import { authenticateMiddleware } from "../middlewares/authenticateMiddleware";
import { authorizeMiddleware } from "../middlewares/authorizeMiddleware";

import { validateRequest } from "../middlewares/validateRequest";

import { asyncHandler } from "../middlewares/asyncHandler";

import { ValidateSlugDto } from "../../database/dtos/ValidateSlug.dto";
import { CreateSkillDto } from "../../database/dtos/CreateSkill.dto";
import { UpdateSkillDto } from "../../database/dtos/UpdateSkill.dto";

import { UserRole } from "../../../constants/enum";

import { SkillController } from "../controllers/skill.controller";
import { SkillService } from "../services/skill.service";
import { skillRepository } from "../repositories/skill.repository";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const skillService = new SkillService(skillRepository); // Pass repo to service
const skillController = new SkillController(skillService); // Pass service to controller

// Public access: Get all skills
router.get("/", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(skillController.getAllSkills)
);
// Public access: Get all skills with their jobs
router.get("/jobs", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(skillController.getAllSkillsWithJobs)
);
// Public access: Get single skill
router.get("/:slug",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(skillController.getSkillBySlug)
);
// Public access: Get single skill with its jobs
router.get("/:slug/jobs",
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(skillController.getSkillWithJobsBySlug)
);

// Admin only: Create new skill
router.post("/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(CreateSkillDto, "body"),
  asyncHandler(skillController.createSkill.bind(skillController))
);
// Admin only: Update skill
router.put("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateSlugDto, "params"),
  validateRequest(UpdateSkillDto, "body"),
  asyncHandler(skillController.updateSkill.bind(skillController))
);
// Admin only: Delete skill
router.delete("/:slug",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateSlugDto, "params"),
  asyncHandler(skillController.deleteSkill.bind(skillController))
);

export default router;