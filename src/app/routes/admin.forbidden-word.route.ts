import { Router } from "express";
import {
  authenticateMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authenticate.middleware";
import { authorizeMiddleware } from "../middlewares/authorize.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { ValidateIdDto } from "../../database/dtos/validate-id.dto";
import { CreateForbiddenWordDto } from "../../database/dtos/create-forbidden-word.dto";
import { UpdateForbiddenWordDto } from "../../database/dtos/update-forbidden-word.dto";

import { UserRole } from "../../../constants/enum";

import { forbiddenWordRepository } from "../repositories/forbidden-word.repository";
import { ForbiddenWordService } from "../services/forbidden-word.service";
import { ForbiddenWordController } from "../controllers/forbidden-word.controller";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const forbiddenWordService = new ForbiddenWordService(forbiddenWordRepository); // Pass repo to service
const forbiddenWordController = new ForbiddenWordController(forbiddenWordService); // Pass service to controller

// Admin only: Get all forbidden words
router.get("/", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(forbiddenWordController.getAllForbiddenWords)
);

// Admin only: Create new forbidden word
router.post("/create",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(CreateForbiddenWordDto, "body"),
  asyncHandler(forbiddenWordController.createForbiddenWord.bind(forbiddenWordController))
);
// Admin only: Update forbidden word
router.put("/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateIdDto, "params"),
  validateRequest(UpdateForbiddenWordDto, "body"),
  asyncHandler(forbiddenWordController.updateForbiddenWord.bind(forbiddenWordController))
);
// Admin only: Delete forbidden word
router.delete("/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateIdDto, "params"),
  asyncHandler(forbiddenWordController.deleteForbiddenWord.bind(forbiddenWordController))
);

export default router;