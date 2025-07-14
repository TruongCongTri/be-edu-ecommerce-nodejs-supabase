import { Router } from "express";
import {
  authenticateMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authenticate.middleware";
import { authorizeMiddleware } from "../middlewares/authorize.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";


import { ValidateSlugDto } from "../../database/dtos/validate-slug.dto";
import { CreateSkillDto } from "../../database/dtos/create-skill.dto";
import { UpdateSkillDto } from "../../database/dtos/update-skill.dto";

import { UserRole } from "../../../constants/enum";

import { SkillController } from "../controllers/skill.controller";
import { SkillService } from "../services/skill.service";
import { skillRepository } from "../repositories/skill.repository";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const skillService = new SkillService(skillRepository); // Pass repo to service
const skillController = new SkillController(skillService); // Pass service to controller

// Admin only: Create new skill
router.post("/create",
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