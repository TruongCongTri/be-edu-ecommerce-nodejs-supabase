import { Router } from "express";
import {
  authenticateMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authenticate.middleware";
import { authorizeMiddleware } from "../middlewares/authorize.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";


import { ValidateIdDto } from "../../database/dtos/validate-id.dto";
import { CreateAllowedOriginDto } from "../../database/dtos/create-allowed-origin.dto";
import { UpdateAllowedOriginDto } from "../../database/dtos/update-allowed-origin.dto";

import { UserRole } from "../../../constants/enum";

import { AllowedOriginController } from "../controllers/allowed-origin.controller";
import { AllowedOriginService } from "../services/allowed-origin.service";
import { allowedOriginRepository } from "../repositories/allowed-origin.repository";
import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const allowedOriginService = new AllowedOriginService(allowedOriginRepository); // Pass repo to service
const allowedOriginController = new AllowedOriginController(allowedOriginService); // Pass service to controller

// Admin only: Get all allowed origins
router.get("/", 
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(allowedOriginController.getAllAllowedOrigins)
);

// Admin only: Create new allowed origin
router.post("/create",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(CreateAllowedOriginDto, "body"),
  asyncHandler(allowedOriginController.createAllowedOrigin.bind(allowedOriginController))
);
// Admin only: Update allowed origin
router.put("/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateIdDto, "params"),
  validateRequest(UpdateAllowedOriginDto, "body"),
  asyncHandler(allowedOriginController.updateAllowedOrigin.bind(allowedOriginController))
);
// Admin only: Delete allowed origin
router.delete("/:id",
  authenticateMiddleware,
  authorizeMiddleware([UserRole.ADMIN]),
  validateRequest(ValidateIdDto, "params"),
  asyncHandler(allowedOriginController.deleteAllowedOrigin.bind(allowedOriginController))
);

export default router;