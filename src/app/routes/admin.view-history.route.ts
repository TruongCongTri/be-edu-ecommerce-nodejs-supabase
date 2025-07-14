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

import { ViewHistoryController } from "../controllers/view-history.controller";
import { ViewHistoryService } from "../services/view-history.service";
import { viewHistoryRepository } from "../repositories/view-history.repository";
import { userRepository } from "../repositories/user.repository";
import { productRepository } from "../repositories/product.repository";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const viewHistoryService = new ViewHistoryService(
  viewHistoryRepository,
  userRepository,
  productRepository
); // Pass repo to service
const viewHistoryController = new ViewHistoryController(viewHistoryService); // Pass service to controller

// Admin only: Create new skill
router.post(
  "/",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(BaseQueryParamsDto, "params"),
  asyncHandler(viewHistoryController.getAllViewHistory)
);

export default router;
