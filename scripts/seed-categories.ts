import { AppDataSource } from "../src/data-source";
import { Category } from "../src/database/entities/Category";
import { slugify } from "../utils/helpers/slugify.helper";

async function seedCategories() {
  try {
    console.log("🔗 Connecting to DB...");
    await AppDataSource.initialize();
    console.log("✅ Connected!");

    const repo = AppDataSource.getRepository(Category);

    // Optional: Clear existing
    // await repo.clear();

    // --- Education-focused Categories ---
    const categoryNames = [
      "Web Development",
      "Data Science",
      "Graphic Design",
      "Digital Marketing",
      "Cybersecurity",
      "UI/UX Design",
      "Business Strategy",
      "Creative Writing",
      "Photography",
      "Machine Learning",
      "Finance and Accounting",
      "Project Management",
      "Language Learning",
      "Music Production",
      "Game Development",
      "Health & Wellness",
      "Personal Development",
      "Career Development",
      "Education & Teaching",
      "Test Preparation"
    ];

    const toInsert = categoryNames.map(name => {
      return repo.create({
        name,
        slug: slugify(name),
        description: `Learn about ${name} with our expert-led courses.`,
      });
    });

    await repo.save(toInsert);
    console.log(`✅ Seeded ${toInsert.length} categories!`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Connection closed.");
  }
}

seedCategories();
