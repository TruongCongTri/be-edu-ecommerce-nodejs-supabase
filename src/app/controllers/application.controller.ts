// src/app/controllers/application.controller.ts
import { Request, Response } from "express";
import { instanceToPlain } from "class-transformer";
import { ApplicationService } from "../services/application.service";
import { AuthenticatedRequest } from "../middlewares/authenticateMiddleware";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { UpdateApplicationStatusDto } from "../../database/dtos/UpdateApplicationStatus.dto";

export class ApplicationController {
  private appService = new ApplicationService();

  createApplication = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await this.appService.createApplication(userId, req.body);

    return successResponse({
      res,
      message: "Application submitted successfully",
      data: { application: instanceToPlain(result) },
    });
  };

  getMyApplications = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;

    const data =
      role === "job_seeker"
        ? await this.appService.getApplicationsForJobSeeker(userId)
        : await this.appService.getApplicationsForEmployer(userId);

    return successResponse({
      res,
      message: "Applications fetched successfully",
      data: { applications: instanceToPlain(data) },
    });
  };

  getMyApplicationsForJobSeeker = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.user!.id;

    const applications = await this.appService.getApplicationsForJobSeeker(
      userId
    );
    const plainData = instanceToPlain(applications);

    return successResponse({
      res,
      message: "Fetched your applications successfully",
      data: { applications: plainData },
    });
  };

  getMyApplicationsForEmployer = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.user!.id;

    const applications = await this.appService.getApplicationsForEmployer(
      userId
    );
    const plainData = instanceToPlain(applications);

    return successResponse({
      res,
      message: "Fetched all applications for your jobs.",
      data: { applications: plainData },
    });
  };

  getApplicationsForJob = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response
  ) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const applications = await this.appService.getApplicationsForJob(
      userId,
      id
    );
    const plainData = instanceToPlain(applications);

    return successResponse({
      res,
      message: "Fetched applications for the job.",
      data: { applications: plainData },
    });
  };

  getApplicationDetailForJobSeeker = async (
    req: AuthenticatedRequest<{ applicationId: string }>,
    res: Response
  ) => {
    const userId = req.user!.id;
    const { applicationId } = req.params;

    const result = await this.appService.getApplicationDetailForJobSeeker(
      userId,
      applicationId
    );

    return successResponse({
      res,
      message: "Get application detail successfully",
      data: { application: instanceToPlain(result) },
    });
  };

  getApplicationDetailForEmployer = async (
    req: AuthenticatedRequest<{ applicationId: string }>,
    res: Response
  ) => {
    const userId = req.user!.id;
    const { applicationId } = req.params;

    const result = await this.appService.getApplicationDetailForEmployer(
      userId,
      applicationId
    );

    return successResponse({
      res,
      message: "Get application detail successfully",
      data: { application: instanceToPlain(result) },
    });
  };

  updateApplicationStatus = async (
    req: AuthenticatedRequest<
      { applicationId: string },
      any,
      UpdateApplicationStatusDto
    >,
    res: Response
  ) => {
    const userId = req.user!.id;
    const { applicationId } = req.params;
    const dto = req.body;

    const updatedApplication = await this.appService.updateApplicationStatus(
      userId,
      applicationId,
      dto
    );

    return successResponse({
      res,
      message: "Application status updated successfully",
      data: { application: instanceToPlain(updatedApplication) },
    });
  };
}
