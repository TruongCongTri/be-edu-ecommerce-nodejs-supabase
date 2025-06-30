import { In } from "typeorm";
import { UserRole } from "../../../constants/enum";
import { AppError } from "../../../utils/errors/AppError";
import { Skill } from "../../database/entities/Skill";
import { skillRepository } from "../repositories/skill.repository";
import {
  userRepository,
  employerRepository,
  jobSeekerRepository,
} from "../repositories/user.repository";
import { slugify } from "../../../utils/helpers/slugify";
import { AdminProfileOutputDto } from "../../database/dtos.output/AdminProfileOut.dto";
import { EmployerProfileOutputDto } from "../../database/dtos.output/EmployerProfileOutput.dto";
import { JobSeekerProfileOutputDto } from "../../database/dtos.output/JobSeekerProfileOutput.dto";

export class UserService {
  private userRepo = userRepository;
  private employerRepo = employerRepository;
  private jobSeekerRepo = jobSeekerRepository;
  private skillRepo = skillRepository;
  constructor() {}

  getProfile = async (
    userId: string
  ): Promise<
    JobSeekerProfileOutputDto | EmployerProfileOutputDto | AdminProfileOutputDto
  > => {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    if (!user) throw new AppError("User not found", 404);

    const baseProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    switch (user.role) {
      case UserRole.JOB_SEEKER: {
        const jobSeeker = await this.jobSeekerRepo.findOne({
          where: { user: { id: user.id } },
          relations: ["skills"],
        });
        if (!jobSeeker) throw new AppError("Job seeker profile not found", 404);

        const result = {
          ...baseProfile,
          skills: jobSeeker?.skills || [],
          resumeUrl: jobSeeker?.resumeUrl || null,
        };

        return new JobSeekerProfileOutputDto(result);
        // return {
        //   ...baseProfile,
        //   skills: jobSeeker?.skills || [],
        //   resumeUrl: jobSeeker?.resumeUrl || null,
        // };
      }

      case UserRole.EMPLOYER: {
        const employer = await this.employerRepo.findOneBy({
          user: { id: user.id },
        });
        if (!employer) throw new AppError("Employer profile not found", 404);

        const result = {
          ...baseProfile,
          companyName: employer?.companyName,
          slug: employer?.slug,
          companyWebsite: employer?.companyWebsite,
          companyDescription: employer?.companyDescription,
          companyLogoUrl: employer?.companyLogoUrl,
        };

        return new EmployerProfileOutputDto(result);
      }

      case UserRole.ADMIN: {
        const result = {
          ...baseProfile,
        };

        return new AdminProfileOutputDto(result);
      }

      default:
        throw new AppError("Invalid user role", 404);
    }
  };

  updateProfile = async (
    userId: string,
    role: UserRole,
    data: any // you'll cast it correctly in controller
  ): Promise<
    JobSeekerProfileOutputDto | EmployerProfileOutputDto | AdminProfileOutputDto
  > => {
    switch (role) {
      case UserRole.JOB_SEEKER: {
        // basic info
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new AppError("User not found", 404);

        user.fullName = data.fullName ?? user.fullName;
        user.address = data.address ?? user.address

        const savedUser = await this.userRepo.save(user);

        // job seeker
        let jobSeeker = await this.jobSeekerRepo.findOne({
          where: { user: { id: userId } },
          relations: ["skills"],
        });
        // if (!jobSeeker) throw new AppError("Job seeker not found", 404);
        // If not exist, create new
        if (!jobSeeker) {
          jobSeeker = this.jobSeekerRepo.create({
            user: { id: userId },
          });
        }

        // Handle skills
        if (data.skillIds?.length) {
          const skills: Skill[] = await this.skillRepo.findBy({ id: In(data.skillIds) });
          jobSeeker.skills = skills 
        }
        jobSeeker.resumeUrl = data.resumeUrl ?? jobSeeker.resumeUrl
        jobSeeker.experienceYears = data.experienceYears ?? jobSeeker.experienceYears;
        jobSeeker.desiredSalary = data.desiredSalary ?? jobSeeker.desiredSalary;

        // return this.jobSeekerRepo.save(jobSeeker);
        const saved = await this.jobSeekerRepo.save(jobSeeker);
        const full = await this.jobSeekerRepo.findOneOrFail({
          where: { id: saved.id },
          relations: ["skills", "user"],
        });

        const result = {
          id: full.user.id,
          fullName: full.user.fullName,
          email: full.user.email,
          role: full.user.role,
          address: full.user.address ?? null,
          resumeUrl: full.resumeUrl ?? null,
          experienceYears: full.experienceYears ?? null,
          desiredSalary: full.desiredSalary ?? null,
          skills: full.skills ?? [],
        };
        return new JobSeekerProfileOutputDto(result);
      }

      case UserRole.EMPLOYER: { 
        // basic info
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new AppError("User not found", 404);

        user.fullName = data.fullName ?? user.fullName;
        const savedUser = await this.userRepo.save(user);

        // employer
        let employer = await this.employerRepo.findOneBy({
          user: { id: userId },
        });
        // if (!employer) throw new AppError("Employer not found", 404);
        // If not exist, create new
        if (!employer) {
          employer = this.employerRepo.create({
            user: { id: userId },
            companyName: data.companyName, // required on creation
            slug: slugify(data.companyName),
          });
        }

        Object.assign(employer, {
          companyName: data.companyName ?? employer.companyName,
          companyDescription: data.companyDescription ?? employer.companyDescription,
          companyWebsite: data.companyWebsite ?? employer.companyWebsite,
          companyLogoUrl: data.companyLogoUrl ?? employer.companyLogoUrl,
          slug: data.companyName ? slugify(data.companyName) : employer.slug,
        });

        // return this.employerRepo.save(employer);
        const saved = await this.employerRepo.save(employer);
        const full = await this.employerRepo.findOneOrFail({
          where: { id: saved.id },
          relations: ["user"],
        });

        return new EmployerProfileOutputDto({
          id: full.user.id,
          fullName: full.user.fullName,
          email: full.user.email,
          role: full.user.role,
          companyName: full.companyName,
          slug: full.slug,
          companyDescription: full.companyDescription,
          companyWebsite: full.companyWebsite,
          companyLogoUrl: full.companyLogoUrl,
        });
      }

      case UserRole.ADMIN: {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new AppError("User not found", 404);

        user.fullName = data.fullName ?? user.fullName;

        // return this.userRepo.save(user);
        const saved = await this.userRepo.save(user);

        return new AdminProfileOutputDto({
          id: saved.id,
          fullName: saved.fullName,
          email: saved.email,
          role: saved.role,
        });
      }

      default:
        throw new AppError("Invalid role", 401);
    }
  };
}
