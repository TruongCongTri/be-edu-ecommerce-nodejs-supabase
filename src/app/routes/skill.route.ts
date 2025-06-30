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

const router = Router();
const skillController = new SkillController();

// Public access: Get all skills
router.get("/", 
  asyncHandler(skillController.getAllSkills)
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