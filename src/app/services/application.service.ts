// src/app/services/application.service.ts

import { AppError } from "../../../utils/errors/AppError";
import { ApplicationOutputDto } from "../../database/dtos.output/ApplicationOutput.dto";
import { CreateApplicationDto } from "../../database/dtos/CreateApplication.dto";
import { UpdateApplicationStatusDto } from "../../database/dtos/UpdateApplicationStatus.dto";
import { ApplicationStatus } from "../../database/entities/Application";
import { applicationRepository } from "../repositories/application.repository";
import { jobRepository } from "../repositories/job.repository";
import {
  employerRepository,
  jobSeekerRepository,
} from "../repositories/user.repository";

export class ApplicationService {
  private appRepo = applicationRepository;
  private jobRepo = jobRepository;
  private jobSeekerRepo = jobSeekerRepository;
  private employerRepo = employerRepository;

  createApplication = async (
    userId: string,
    dto: CreateApplicationDto
  ): Promise<ApplicationOutputDto> => {
    const job = await this.jobRepo.findOneBy({ id: dto.jobId });
    if (!job) throw new AppError("Job not found", 404);

    const jobSeeker = await this.jobSeekerRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });
    if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

    // Prevent duplicate applications
    const existingApp = await this.appRepo.findOne({
      where: {
        job: { id: dto.jobId },
        jobSeeker: { id: jobSeeker.id },
      },
    });
    if (existingApp)
      throw new AppError("You already applied for this job", 400);

    const application = this.appRepo.create({
      job,
      jobSeeker,
      coverLetter: dto.coverLetter,
      appliedAt: new Date(),
    });

    const saved = await this.appRepo.save(application);
    return ApplicationOutputDto.fromEntity(saved);
  };

  getApplicationsForEmployer = async (
    userId: string
  ): Promise<ApplicationOutputDto[]> => {
    const employer = await this.employerRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!employer) throw new AppError("Employer profile not found", 404);

    const applications = await this.appRepo.find({
      where: { job: { employer: { id: employer.id } } },
      relations: {
        job: {
          category: true,
          employer: true,
          skills: true,
          locations: true,
        },
        jobSeeker: {
          user: true,
          skills: true,
        },
      },
      order: { appliedAt: "DESC" },
    });

    return applications.map(ApplicationOutputDto.fromEntity);
  };

  getApplicationsForJobSeeker = async (
    userId: string
  ): Promise<ApplicationOutputDto[]> => {
    const jobSeeker = await this.jobSeekerRepo.findOne({
      where: { user: { id: userId } },
      relations: ["applications", "applications.job"],
    });
    if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

    const applications = await this.appRepo.find({
      where: { jobSeeker: { id: jobSeeker.id } },
      relations: {
        job: {
          employer: true,
          category: true,
          skills: true,
          locations: true,
        },
        jobSeeker: {
          user: true,
          skills: true,
        },
      },
      order: { appliedAt: "DESC" },
    });

    return applications.map(ApplicationOutputDto.fromEntity);
  };

  getApplicationsForJob = async (
    userId: string,
    jobId: string
  ): Promise<ApplicationOutputDto[]> => {
    const employer = await this.employerRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!employer) throw new AppError("Employer profile not found", 404);

    const job = await this.jobRepo.findOne({
      where: {
        id: jobId,
        employer: { id: employer.id },
      },
    });
    if (!job) throw new AppError("Job not found or not owned by you", 404);

    const applications = await this.appRepo.find({
      where: { job: { id: jobId } },
      relations: {
        job: {
          category: true,
          employer: true,
          skills: true,
          locations: true,
        },
        jobSeeker: {
          user: true,
          skills: true,
        },
      },
      order: { appliedAt: "DESC" },
    });

    return applications.map(ApplicationOutputDto.fromEntity);
  };

  getApplicationDetailForJobSeeker = async (
    userId: string,
    applicationId: string
  ): Promise<ApplicationOutputDto> => {
    const application = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: [
        "job",
        "job.category",
        "job.locations",
        "job.skills",
        "job.employer",
        "jobSeeker",
        "jobSeeker.user",
      ],
    });

    if (!application) throw new AppError("Application not found", 404);
    if (application.jobSeeker.user.id !== userId)
      throw new AppError(
        "You are not authorized to view this application's detail",
        403
      );

    return ApplicationOutputDto.fromEntity(application);
  };

  getApplicationDetailForEmployer = async (
    userId: string,
    applicationId: string
  ): Promise<ApplicationOutputDto> => {
    const application = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: ["job", "job.employer", "jobSeeker", "jobSeeker.user"],
    });

    if (!application) throw new AppError("Application not found", 404);
    if (application.job.employer.userId !== userId) {
      throw new AppError(
        "You are not authorized to view this application's detail",
        403
      );
    }

    return ApplicationOutputDto.fromEntity(application);
  };

  updateApplicationStatus = async (
    userId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto
  ): Promise<ApplicationOutputDto> => {
    const application = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: ["job", "job.employer", "jobSeeker", "jobSeeker.user"],
    });

    if (!application) throw new AppError("Application not found", 404);

    if (application.job.employer.userId !== userId) {
      throw new AppError(
        "You are not authorized to update this application",
        403
      );
    }

    // ✅ Enforce valid transitions
    const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.PENDING]: [ApplicationStatus.REVIEWED],
      [ApplicationStatus.REVIEWED]: [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.ACCEPTED]: [ApplicationStatus.INTERVIEW],
      [ApplicationStatus.REJECTED]: [],
      [ApplicationStatus.INTERVIEW]: [],
    };

    const currentStatus = application.status;
    const newStatus = dto.status;

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
        400
      );
    }

    application.status = dto.status;
    await this.appRepo.save(application);

    return ApplicationOutputDto.fromEntity(application);
  };
}
