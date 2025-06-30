import { Request, Response } from "express";
import { SkillService } from "../services/skill.service";
import { successResponse } from "../../../utils/errors/responses/successResponse";
import { SkillOutputDto } from "../../database/dtos.output/SkillOutput.dto";
import { instanceToPlain } from "class-transformer";

export class SkillController {
  private skillService = new SkillService();
  constructor() {}

  // GET /api/skills
  getAllSkills = async (req: Request, res: Response) => {
    const skills = await this.skillService.getAllSkills();

    const skillDtos = skills.map(SkillOutputDto.fromEntity);
    const plainData = instanceToPlain(skillDtos);

    return successResponse({
      res,
      message: "List of skills",
      data: { skills: plainData },
    });
  };
  // GET /api/skills/:slug
  getSkillBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const skill = await this.skillService.getSkillBySlug(slug);

    const skillDto = SkillOutputDto.fromEntity(skill);
    const plainData = instanceToPlain(skillDto);

    return successResponse({
      res,
      message: "Single Skill",
      data: { skill: plainData },
    });
  };
  // GET /api/skills/:slug/jobs
  getSkillWithJobsBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const skill = await this.skillService.getSkillWithJobsBySlug(slug);

    const skillDto = SkillOutputDto.fromEntity(skill);
    const plainData = instanceToPlain(skillDto);

    return successResponse({
      res,
      message: "Single Skill and its jobs",
      data: { skill: plainData },
    });
  };

  // POST /api/skills
  createSkill = async (req: Request, res: Response) => {
    const skill = await this.skillService.createSkill(req.body);

    const skillDto = SkillOutputDto.fromEntity(skill);
    const plainData = instanceToPlain(skillDto);

    return successResponse({
      res,
      message: "Skill created successfully",
      data: { skill: plainData },
    });
  };

  // PUT /api/skills/:slug
  updateSkill = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const skill = await this.skillService.updateSkill(slug, req.body);

    const skillDto = SkillOutputDto.fromEntity(skill);
    const plainData = instanceToPlain(skillDto);
    console.log(plainData);
    
    return successResponse({
      res,
      message: "Skill updated successfully",
      data: { skill: plainData },
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
