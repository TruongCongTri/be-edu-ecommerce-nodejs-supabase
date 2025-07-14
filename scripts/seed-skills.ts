import { AppDataSource } from "../src/data-source";
import { Skill } from "../src/database/entities/Skill";
import { slugify } from "../utils/helpers/slugify.helper";

async function seedSkills() {
  try {
    console.log("🔗 Connecting to DB...");
    await AppDataSource.initialize();
    console.log("✅ Connected!");

    const repo = AppDataSource.getRepository(Skill);

    // Optional: Clear existing
    // await repo.clear();

    // --- Education-focused Skills ---
    const skillNames = [
      "HTML & CSS",
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "SQL",
      "MongoDB",
      "Data Visualization",
      "Machine Learning Fundamentals",
      "Deep Learning",
      "Secure Coding",
      "Penetration Testing",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "UX Research",
      "Prototyping",
      "Copywriting",
      "SEO Strategy",
      "Content Marketing",
      "Google Analytics",
      "Agile Methodology",
      "Scrum Mastery",
      "Financial Modeling",
      "Budget Planning",
      "Language Fluency",
      "Public Speaking",
      "Music Theory",
      "Audio Editing",
      "Game Design",
      "Unity Development",
      "3D Modeling",
      "Cloud Computing",
      "API Development",
      "Microservices",
      "DevOps Basics",
      "Containerization",
      "Project Scheduling",
      "Risk Management",
      "Instructional Design",
      "Test Prep Strategy",
      "Exam Techniques",
      "Interview Preparation",
      "Career Coaching",
      "Mindfulness",
      "Stress Management",
      "Productivity Hacking",
      "Team Leadership",
      "Negotiation Skills",
      "Emotional Intelligence"
    ];

    const toInsert = skillNames.map(name => {
      return repo.create({
        name,
        slug: slugify(name),
        description: `Master ${name} to level up your career and knowledge.`,
      });
    });

    await repo.save(toInsert);
    console.log(`✅ Seeded ${toInsert.length} skills!`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Connection closed.");
  }
}

seedSkills();
