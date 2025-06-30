import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { RegisterDto } from "../../database/dtos/Register.dto";
import { UserRole } from "../../../constants/enum";
import { LoginDto } from "../../database/dtos/Login.dto";
import { AuthenticatedRequest } from "../middlewares/authenticateMiddleware";
import { ChangePasswordDto } from "../../database/dtos/ChangePassword.dto";
import { LoginOutputDto } from "../../database/dtos.output/LoginOutput.dto";
import { instanceToPlain } from "class-transformer";
import { RegisterOutputDto } from "../../database/dtos.output/RegisterOutput.dto";

export class AuthController {
  private authService = new AuthService();

  constructor() {}

  registerJobSeeker = async (
    req: Request<{}, {}, RegisterDto>,
    res: Response
  ) => {
    const result =  await this.authService.register(req.body, UserRole.JOB_SEEKER);
    
    const registerDto = RegisterOutputDto.fromData(result);
    const plainData = instanceToPlain(registerDto);

    return successResponse({
      res,
      message: "Job seeker registered",
      data: { register: plainData },
    });
  };
  registerEmployer = async (
    req: Request<{}, {}, RegisterDto>,
    res: Response
  ) => {
    const result = await this.authService.register(req.body, UserRole.EMPLOYER);
    
    const registerDto = RegisterOutputDto.fromData(result);
    const plainData = instanceToPlain(registerDto);

    return successResponse({
      res,
      message: "Employer registered",
      data: { register: plainData },
    });
  };
  registerAdmin = async (req: Request<{}, {}, RegisterDto>, res: Response) => {
    const result = await this.authService.register(req.body, UserRole.ADMIN);
    
    const registerDto = RegisterOutputDto.fromData(result);
    const plainData = instanceToPlain(registerDto);

    return successResponse({
      res,
      message: "Admin registered",
      data: { register: plainData },
    });
  };

  login = async (req: Request<{}, {}, LoginDto>, res: Response) => {
    const result = await this.authService.login(req.body);

    const jobDto = LoginOutputDto.fromData(result.token);
    const plainData = instanceToPlain(jobDto);

    return successResponse({
      res,
      message: "Login successful",
      data: { login: plainData },
    });
  };

  changePassword = async (
    req: AuthenticatedRequest<{}, {}, ChangePasswordDto>,
    res: Response
  ) => {
    const userId = req.user!.id;
    await this.authService.changePassword(userId, req.body);
    return successResponse({
      res,
      message: "Password changed successfully",
    });
  };
}
