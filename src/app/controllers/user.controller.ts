import { instanceToPlain } from "class-transformer";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { AuthenticatedRequest } from "../middlewares/authenticate.middleware";
import { UserService } from "../services/user.service";
import { Response } from "express";

export class UserController {
  // private userService = new UserService();
  // constructor() {}

  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    // Extract the ID of the authenticated user
    const userId = req.user!.id;

    // Delegate to UserService to fetch the user's profile
    // Expecting ProfileOutputDto from the service
    const profileDto = await this.userService.getProfile(userId);
    // const plainProfile = instanceToPlain(profileDto);

    return successResponse({
      res,
      message: "Get profile successfully",
      data: { profile: profileDto },
    });
  };

  getStudentProfile = async (req: AuthenticatedRequest, res: Response) => {
    // Extract the ID of the authenticated user
    const userId = req.user!.id;

    // Delegate to UserService to fetch the user's profile
    // Expecting ProfileOutputDto from the service
    const profileDto = await this.userService.getStudentDetail(userId);
    // const plainProfile = instanceToPlain(profileDto);

    return successResponse({
      res,
      message: "Get Student profile successfully",
      data: { profile: profileDto },
    });
  };

  getEducatorProfile = async (req: AuthenticatedRequest, res: Response) => {
    // Extract the ID of the authenticated user
    const userId = req.user!.id;

    // Delegate to UserService to fetch the user's profile
    // Expecting ProfileOutputDto from the service
    const profileDto = await this.userService.getEducatorDetail(userId);
    // const plainProfile = instanceToPlain(profileDto);

    return successResponse({
      res,
      message: "Get Educator profile successfully",
      data: { profile: profileDto },
    });
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id; // Get the ID of the authenticated user
    const role = req.user!.role; // Get the role of the authenticated user

    // Delegate to UserService, passing user ID, role, and the request body (which is already validated
    // and transformed into the correct DTO type by the route's middleware).
    const profileDto = await this.userService.updateProfile(
      userId,
      role,
      req.body
    );
    // const plainData = instanceToPlain(profileDto);

    return successResponse({
      res,
      message: "Profile updated successfully",
      data: { profile: profileDto },
    });
  };
}
