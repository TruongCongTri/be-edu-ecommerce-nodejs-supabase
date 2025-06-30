import { Request, Response } from "express";
import { JobService } from "../services/job.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { CreateJobDto } from "../../database/dtos/CreateJob.dto";
import { AuthenticatedRequest } from "../middlewares/authenticateMiddleware";
import { UpdateJobDto } from "../../database/dtos/UpdateJob.dto";
import { JobFilterParams } from "../../database/dtos/JobFilterParams.dto";
import { JobOutputDto } from "../../database/dtos.output/JobOutput.dto";
import { instanceToPlain } from "class-transformer";
import { JobPartialOutputDto } from "../../database/dtos.output/JobPartialOutput.dto";
// import { plainToInstance } from "class-transformer";
// import { JobOutputDto } from "../../database/dtos.output/JobOutput.dto";

export class JobController {
  private jobService = new JobService();

  constructor() {}

  filterAllJobs = async (req: Request, res: Response) => {
    const filterParams = req.query as JobFilterParams;
    const { data, pagination } = await this.jobService.getAllFilteredJobs(
      filterParams
    );

    const jobDtos = data.jobs.map(JobOutputDto.fromEntity);
    const plainData = instanceToPlain(jobDtos);

    return successResponse({
      res,
      message: "Jobs fetched successfully",
      // data: { jobs: jobsDto },
      data: { jobs: plainData },
      pagination,
    });
  };

  getAllJobs = async (req: Request, res: Response) => {
    const jobs = await this.jobService.getAllJobs();

    const jobDtos = jobs.map(JobPartialOutputDto.fromEntity);
    const plainData = instanceToPlain(jobDtos);

    return successResponse({
      res,
      message: "Jobs fetched successfully",
      data: { jobs: plainData },
    });
  };
  getAllEmployerJobs = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const employerId = req.user!.id;

    const employerJobs = await this.jobService.getAllEmployerJobs(employerId);

    const jobDtos = employerJobs.map(JobPartialOutputDto.fromEntity);
    const plainData = instanceToPlain(jobDtos);

    return successResponse({
      res,
      message: "Employer Jobs fetched successfully",
      data: { jobs: plainData },
    });
  };
  getAllJobDetails = async (req: Request, res: Response) => {
    const jobs = await this.jobService.getAllJobDetails();

    const jobDtos = jobs.map(JobOutputDto.fromEntity);
    const plainData = instanceToPlain(jobDtos);

    return successResponse({
      res,
      message: "Job details fetched successfully",
      data: { jobs: plainData },
    });
  };
  getJobBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;

    const job = await this.jobService.getJobBySlug(slug);

    const jobDtos = JobPartialOutputDto.fromEntity(job);
    const plainData = instanceToPlain(jobDtos);

    return successResponse({
      res,
      message: "Job detail",
      data: { job: plainData },
    });
  };
  getJobDetailBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;

    const job = await this.jobService.getJobDetailBySlug(slug);
    console.log(job);

    const jobDto = JobOutputDto.fromEntity(job);
    const plainData = instanceToPlain(jobDto);

    return successResponse({
      res,
      message: "Job detail",
      data: { job: plainData },
    });
  };

  createJob = async (
    req: AuthenticatedRequest<{}, {}, CreateJobDto>,
    res: Response
  ) => {
    const employerId = req.user!.id;

    const job = await this.jobService.createJob(req.body, employerId);

    const jobDto = JobOutputDto.fromEntity(job);
    const plainData = instanceToPlain(jobDto);

    return successResponse({
      res,
      message: "Job created successfully",
      data: { job: plainData },
    });
  };
  updateJob = async (
    req: AuthenticatedRequest<{ slug: string }, {}, UpdateJobDto>,
    res: Response
  ) => {
    const { slug } = req.params;
    const employerId = req.user!.id;

    const updated = await this.jobService.updateJob(slug, req.body, employerId);

    const jobDto = JobOutputDto.fromEntity(updated);
    const plainData = instanceToPlain(jobDto);

    return successResponse({
      res,
      message: "Job updated successfully",
      data: { job: plainData },
    });
  };
  deleteJob = async (
    req: AuthenticatedRequest<{ slug: string }>,
    res: Response
  ) => {
    const { slug } = req.params;
    const employerId = req.user!.id;

    await this.jobService.deleteJob(slug, employerId);

    return successResponse({ res, message: "Job deleted successfully" });
  };
}
