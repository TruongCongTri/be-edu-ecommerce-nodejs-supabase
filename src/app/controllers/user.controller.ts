import { instanceToPlain } from "class-transformer";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { AuthenticatedRequest } from "../middlewares/authenticateMiddleware";
import { UserService } from "../services/user.service";
import { Response } from "express";

export class UserController {
  private userService = new UserService();

  constructor() {}

  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const profileDto = await this.userService.getProfile(userId);
    const plainProfile = instanceToPlain(profileDto);

    return successResponse({
      res,
      message: "Get profile successfully",
      data: { profile: plainProfile },
    });
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;

    const profile = await this.userService.updateProfile(
      userId,
      role,
      req.body
    );
    const plainData = instanceToPlain(profile);

    return successResponse({
      res,
      message: "Profile updated successfully",
      data: { profile: plainData },
    });
  };
}
