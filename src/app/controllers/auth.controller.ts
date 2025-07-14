import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { CreateUserDto } from "../../database/dtos/create-user.dto";
import { UserRole } from "../../../constants/enum";
import { LoginDto } from "../../database/dtos/Login.dto";
import { AuthenticatedRequest } from "../middlewares/authenticate.middleware";
import { ChangePasswordDto } from "../../database/dtos/change-password.dto";

export class AuthController {
  // private authService = new AuthService();
  // constructor() {}

  // Service is injected via constructor
  constructor(private authService: AuthService) {}

  registerStudent = async (
    req: Request<{}, {}, CreateUserDto>,
    res: Response
  ) => {
    // Delegate to AuthService, passing the registration data and the specific role
    const registeredJobSeeker = await this.authService.register(
      req.body,
      UserRole.STUDENT
    );

    return successResponse({
      res,
      message: "Job seeker registered",
      data: { register: registeredJobSeeker },
    });
  };
  registerEducator = async (
    req: Request<{}, {}, CreateUserDto>,
    res: Response
  ) => {
    // Delegate to AuthService, passing the registration data and the specific role
    const registeredEmployer = await this.authService.register(req.body, UserRole.EDUCATOR);

    return successResponse({
      res,
      message: "Employer registered",
      data: { register: registeredEmployer },
    });
  };
  registerAdmin = async (
    req: Request<{}, {}, CreateUserDto>, 
    res: Response
  ) => {
    // Delegate to AuthService, passing the registration data and the specific role
    const registeredAdmin = await this.authService.register(req.body, UserRole.ADMIN);

    return successResponse({
      res,
      message: "Admin registered",
      data: { register: registeredAdmin },
    });
  };

  login = async (req: Request<{}, {}, LoginDto>, res: Response) => {
    // Delegate to AuthService to handle login logic (authentication, token generation)
    const result = await this.authService.login(req.body);

    return successResponse({
      res,
      message: "Login successful",
      data: { login: result },
    });
  };

  changePassword = async (
    req: AuthenticatedRequest<{}, {}, ChangePasswordDto>,
    res: Response
  ) => {
    // Extract the ID of the authenticated user
    const userId = req.user!.id;

    // Delegate to AuthService to handle password change logic
    await this.authService.changePassword(userId, req.body);
    return successResponse({
      res,
      message: "Password changed successfully",
      statusCode: 204,
    });
  };
}
