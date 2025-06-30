import { skillRepository } from "../repositories/skill.repository";
import { Skill } from "../../database/entities/Skill";

import { CreateSkillDto } from "../../database/dtos/CreateSkill.dto";
import { UpdateSkillDto } from "../../database/dtos/UpdateSkill.dto";

import { slugify } from "../../../utils/helpers/slugify";
import { AppError } from "../../../utils/errors/AppError";

export class SkillService {
  private skillRepo = skillRepository;
  constructor() {}

  // Get all skills - public access
  getAllSkills = async (): Promise<Skill[]> => {
    return await this.skillRepo.find({ order: { createdAt: "DESC" } });
  };
  // Get single skill by slug - public access
  getSkillBySlug = async (slug: string): Promise<Skill> => {
    const skill = await this.skillRepo.findOne({
      where: { slug },
    });
    if (!skill) throw new AppError("Skill not found", 404);
    return skill;
  };
  // Get single skill with its jobs by slug - public access
  getSkillWithJobsBySlug = async (slug: string): Promise<Skill> => {
    const skill = await this.skillRepo.findOne({
      where: { slug },
      relations: ["jobs"],
    });
    if (!skill) throw new AppError("Skill not found", 404);
    return skill;
  };

  // Create new skill - restricted access for only admin
  createSkill = async (dto: CreateSkillDto): Promise<Skill> => {
    const existing = await this.skillRepo.findOneBy({ name: dto.name });
    if (existing) throw new AppError("Skill already exists", 409);

    const skill = this.skillRepo.create({
      ...dto,
      slug: slugify(dto.name),
    });

    return await this.skillRepo.save(skill);
  };
  // Update a skill - restricted access for only admin
  updateSkill = async (slug: string, dto: UpdateSkillDto): Promise<Skill> => {
    const skillToUpdate = await this.getSkillBySlug(slug);
    if (!skillToUpdate) throw new AppError("Skill not found", 404);
    console.log("Service: ", skillToUpdate);
    
    const { name } = dto;
    console.log("Service - name: ", name);
    
    if (name !== skillToUpdate.name) {
      const existing = await this.skillRepo.findOneBy({ name });
      if (existing) throw new AppError("Skill already exists", 409);
    }

    skillToUpdate.name = name || skillToUpdate.name;
    // skill.slug = dto.name ? slugify(dto.name) : skill.slug;

    return await this.skillRepo.save(skillToUpdate);
  };
  // Delete a skill - restricted access for only admin
  deleteSkill = async (slug: string): Promise<void> => {
    const skill = await this.getSkillBySlug(slug);
    if (!skill) throw new AppError("Skill not found", 404);

    await this.skillRepo.remove(skill);
  };
}
