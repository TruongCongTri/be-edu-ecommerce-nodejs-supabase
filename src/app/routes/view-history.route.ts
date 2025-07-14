import { Router } from "express";

import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

import { ValidateSlugDto } from "../../database/dtos/validate-slug.dto";

import { BaseQueryParamsDto } from "../../database/dtos/base-query-params.dto";
import { ViewHistoryService } from "../services/view-history.service";
import { ViewHistoryController } from "../controllers/view-history.controller";
import { viewHistoryRepository } from "../repositories/view-history.repository";
import { userRepository } from "../repositories/user.repository";
import { productRepository } from "../repositories/product.repository";
import { authenticateMiddleware } from "../middlewares/authenticate.middleware";
import { CreateViewHistoryDto } from "../../database/dtos/create-view-history.dto";
import { RemoveViewHistoryDto } from "../../database/dtos/remove-view-history.dto";
import { ValidateIdDto } from "../../database/dtos/validate-id.dto";

const router = Router();
// Dependency Injection (DI) in Controllers and Services:
const viewHistoryService = new ViewHistoryService(
  viewHistoryRepository,
  userRepository,
  productRepository
); // Pass repo to service
const viewHistoryController = new ViewHistoryController(viewHistoryService); // Pass service to controller

router.get("/", 
  authenticateMiddleware,
  validateRequest(BaseQueryParamsDto, "query"),
  asyncHandler(viewHistoryController.getUserViewHistory)
);

router.post("/",
  authenticateMiddleware,
  validateRequest(CreateViewHistoryDto, "body"),
  asyncHandler(viewHistoryController.addViewHistory.bind(viewHistoryController))
);

router.delete("/:id",
  authenticateMiddleware,
  validateRequest(ValidateIdDto, "params"),
  asyncHandler(viewHistoryController.removeUserViewHistoryEntry.bind(viewHistoryController))
);
export default router;