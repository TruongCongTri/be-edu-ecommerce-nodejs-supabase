// src/app/controllers/application.controller.ts
import { Response } from "express";
import { ApplicationService } from "../services/application.service";
import { AuthenticatedRequest } from "../middlewares/authenticateMiddleware";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { UpdateApplicationStatusDto } from "../../database/dtos/UpdateApplicationStatus.dto";
import { CreateApplicationDto } from "../../database/dtos/CreateApplication.dto";
import { ApplicationOutputDto } from "../../database/dtos.output/ApplicationOutput.dto";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";

export class ApplicationController {
  // private appService = new ApplicationService();
  private appService: ApplicationService;

  constructor(appService: ApplicationService) {
    this.appService = appService;
  }

  // job seeker specific methods
  createApplication = async (
    req: AuthenticatedRequest<{}, {}, CreateApplicationDto>,
    res: Response
  ) => {
    // Extract the ID of the authenticated job seeker
    const userId = req.user!.id;

    // Delegate to ApplicationService to handle application creation logic
    const resultDto = await this.appService.createApplication(userId, req.body);

    return successResponse({
      res,
      message: "Application submitted successfully",
      data: { application: resultDto },
    });
  };
  getMyApplicationsForJobSeeker = async (
    req: AuthenticatedRequest<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the ID of the authenticated job seeker
    const userId = req.user!.id;
    // Extract the validated query parameters
    const queryParams = req.query;

    // Delegate to ApplicationService to fetch all applications for this job seeker
    // Expecting an array of ApplicationOutputDto instances
    const { applications, pagination } =
      await this.appService.getApplicationsForJobSeeker(userId, queryParams);
    // const plainData = instanceToPlain(applications);

    return successResponse({
      res,
      message: "Fetched your applications successfully",
      data: { applications: applications },
      pagination: pagination,
    });
  };
  getApplicationDetailForJobSeeker = async (
    req: AuthenticatedRequest<{ applicationId: string }>,
    res: Response
  ) => {
    // Extract the ID of the authenticated job seeker
    const userId = req.user!.id;
    // Extract the application ID from the URL parameters
    const { applicationId } = req.params;

    // Delegate to ApplicationService to fetch the specific application detail
    // This service method will also handle authorization (ensuring the application belongs to the job seeker)
    const resultDtos = await this.appService.getApplicationDetailForJobSeeker(
      userId,
      applicationId
    );

    return successResponse({
      res,
      message: "Get application detail successfully",
      data: { application: resultDtos },
    });
  };

  // employer specific methods
  getMyApplicationsForEmployer = async (
    req: AuthenticatedRequest<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the ID of the authenticated employer
    const userId = req.user!.id;
    // Extract the validated query parameters
    const queryParams = req.query;

    // Delegate to ApplicationService to fetch all applications related to this employer's jobs
    // Expecting an array of ApplicationOutputDto instances
    const { applications, pagination } =
      await this.appService.getApplicationsForEmployer(userId, queryParams);
    // const plainData = instanceToPlain(applications);

    return successResponse({
      res,
      message: "Fetched all applications for your jobs.",
      data: { applications: applications },
      pagination: pagination,
    });
  };

  getApplicationsForJobForEmployer = async (
    req: AuthenticatedRequest<{ id: string }, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the ID of the authenticated employer
    const userId = req.user!.id;
    // Extract the job ID from the URL parameters
    const { id: jobId } = req.params;
    // Extract the validated query parameters
    const queryParams = req.query;

    // Delegate to ApplicationService to fetch applications for this specific job
    // This service method will also handle authorization (ensuring the job belongs to the employer)
    const { applications, pagination } =
      await this.appService.getApplicationsForJobForEmployer(
        userId,
        jobId,
        queryParams
      );
    // const plainData = instanceToPlain(applications);

    return successResponse({
      res,
      message: "Fetched applications for the job.",
      data: { applications: applications },
      pagination: pagination,
    });
  };

  getApplicationDetailForEmployer = async (
    req: AuthenticatedRequest<{ applicationId: string }>,
    res: Response
  ) => {
    // Extract the ID of the authenticated employer
    const userId = req.user!.id;
    // Extract the application ID from the URL parameters
    const { applicationId } = req.params;

    // Delegate to ApplicationService to fetch the specific application detail
    // This service method will also handle authorization (ensuring the application belongs to one of the employer's jobs)
    const resultDto: ApplicationOutputDto =
      await this.appService.getApplicationDetailForEmployer(
        userId,
        applicationId
      );

    return successResponse({
      res,
      message: "Get application detail successfully",
      data: { application: resultDto },
    });
  };

  updateApplicationStatus = async (
    req: AuthenticatedRequest<{ id: string }, any, UpdateApplicationStatusDto>,
    res: Response
  ) => {
    // Extract the ID of the authenticated employer
    const userId = req.user!.id;
    // Extract the application ID from the URL parameters
    const { id: applicationId } = req.params; // Renaming 'id' to 'applicationId' for clarity
    // Extract the DTO from the request body (contains the new status)
    const dto = req.body;

    // Delegate to ApplicationService to update the application status
    // This service method will handle authorization (ensuring the application's job belongs to the employer)
    const updatedApplicationDto: ApplicationOutputDto =
      await this.appService.updateApplicationStatus(userId, applicationId, dto);

    return successResponse({
      res,
      message: "Application status updated successfully",
      data: { application: updatedApplicationDto },
    });
  };
}
