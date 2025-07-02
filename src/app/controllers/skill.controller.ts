import { Request, Response } from "express";
import { SkillService } from "../services/skill.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { SkillOutputDto } from "../../database/dtos.output/SkillOutput.dto";
import { instanceToPlain } from "class-transformer";
import { BaseQueryParamsDto } from "../../database/dtos/BasicQueryParams.dto";

export class SkillController {
  // private skillService = new SkillService();
  // constructor() {}

  constructor(private skillService: SkillService) {}

  // GET /api/skills
  getAllSkills = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { skills, pagination } = await this.skillService.getAllSkills(queryParams);

    // const skillDtos = skills.map(SkillOutputDto.fromEntity);
    // const plainData = instanceToPlain(skillDtos);

    return successResponse({
      res,
      message: "List of skills",
      data: { skills: skills },
      pagination: pagination,
    });
  };
  // GET /api/skills/jobs
  getAllSkillsWithJobs = async (
    req: Request<any, BaseQueryParamsDto>,
    res: Response
  ) => {
    // Extract the validated query parameters
    const queryParams = req.query;

    const { skills, pagination } = await this.skillService.getAllSkillsWithJobs(queryParams);

    // const skillDtos = skills.map(SkillOutputDto.fromEntity);
    // const plainData = instanceToPlain(skillDtos);

    return successResponse({
      res,
      message: "List of skills and their jobs",
      data: { skills: skills },
      pagination: pagination,
    });
  };
  // GET /api/skills/:slug
  getSkillBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const skill = await this.skillService.getSkillBySlug(slug);

    const skillDto = SkillOutputDto.fromEntity(skill);
    // const plainData = instanceToPlain(skillDto);

    return successResponse({
      res,
      message: "Single Skill",
      data: { skill: skillDto },
    });
  };
  // GET /api/skills/:slug/jobs
  getSkillWithJobsBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const skill = await this.skillService.getSkillWithJobsBySlug(slug);

    const skillDto = SkillOutputDto.fromEntity(skill);
    // const plainData = instanceToPlain(skillDto);

    return successResponse({
      res,
      message: "Single Skill and its jobs",
      data: { skill: skillDto },
    });
  };

  // POST /api/skills
  createSkill = async (req: Request, res: Response) => {
    const skill = await this.skillService.createSkill(req.body);

    const skillDto = SkillOutputDto.fromEntity(skill);
    // const plainData = instanceToPlain(skillDto);

    return successResponse({
      res,
      message: "Skill created successfully",
      data: { skill: skillDto },
    });
  };

  // PUT /api/skills/:slug
  updateSkill = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const skill = await this.skillService.updateSkill(slug, req.body);

    const skillDto = SkillOutputDto.fromEntity(skill);
    // const plainData = instanceToPlain(skillDto);

    return successResponse({
      res,
      message: "Skill updated successfully",
      data: { skill: skillDto },
    });
  };

  // DELETE /api/skills/:slug
  deleteSkill = async (req: Request, res: Response) => {
    const { slug } = req.params;
    await this.skillService.deleteSkill(slug);

    return successResponse({
      res,
      message: "Skill deleted successfully",
    });
  };
}
