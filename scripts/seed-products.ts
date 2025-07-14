import { AppDataSource } from "../src/data-source";
import { User } from "../src/database/entities/User";
import { Product } from "../src/database/entities/Product";
import { ProductDetail } from "../src/database/entities/ProductDetail";
import { Category } from "../src/database/entities/Category";
import { Skill } from "../src/database/entities/Skill";
import { UserRole } from "../constants/enum";
import { faker } from "@faker-js/faker";
import { slugify } from "../utils/helpers/slugify.helper";

async function seedProductsWithDetails() {
  try {
    console.log("🔗 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Connected!");

    const userRepo = AppDataSource.getRepository(User);
    const productRepo = AppDataSource.getRepository(Product);
    const categoryRepo = AppDataSource.getRepository(Category);
    const skillRepo = AppDataSource.getRepository(Skill);

    // --- 1️⃣ Load Educators, Categories, Skills ---
    const educators = await userRepo.find({
      where: { role: UserRole.EDUCATOR },
    });

    if (educators.length === 0) throw new Error("❌ No educators found. Seed users first.");
    const categories = await categoryRepo.find();
    if (categories.length === 0) throw new Error("❌ No categories found. Seed categories first.");
    const skills = await skillRepo.find();
    if (skills.length === 0) throw new Error("❌ No skills found. Seed skills first.");

    console.log(`ℹ️ Found ${educators.length} educators`);
    console.log(`ℹ️ Found ${categories.length} categories`);
    console.log(`ℹ️ Found ${skills.length} skills`);

    // --- 2️⃣ Curated educational subjects for better names ---
    const subjects = [
      "Web Development", "Data Science", "Graphic Design", "Digital Marketing",
      "Cybersecurity", "UI/UX Design", "Business Strategy", "Creative Writing",
      "Photography", "Machine Learning", "Finance", "Project Management",
      "Language Learning", "Music Production", "Game Development"
    ];
    const levels = ["Beginner", "Intermediate", "Advanced", "Complete", "Masterclass"];

    const allProductsToSave: Product[] = [];

    // --- 3️⃣ For each Educator, create 6 Products ---
    for (const educator of educators) {
      console.log(`👨‍🏫 Seeding products for educator: ${educator.email}`);

      for (let p = 0; p < 6; p++) {
        // 📌 Generate realistic course name
        const courseName = `${faker.helpers.arrayElement(levels)} ${faker.helpers.arrayElement(subjects)}`;
        const slug = slugify(`${courseName}-${faker.string.alphanumeric(4)}`);

        // 📌 Pick random category
        const category = faker.helpers.arrayElement(categories);

        // 📌 Pick 2–5 random skills
        const numSkills = faker.number.int({ min: 2, max: 5 });
        const selectedSkills = faker.helpers.arrayElements(skills, numSkills);

        // 📌 Generate ProductDetails (5–8 lessons)
        const numDetails = faker.number.int({ min: 5, max: 8 });
        const curriculum: ProductDetail[] = [];
        for (let d = 1; d <= numDetails; d++) {
          const lessonTitle = `${faker.helpers.arrayElement(["Introduction to", "Advanced", "Workshop on", "Mastering", "Foundations of"])} ${faker.helpers.arrayElement(subjects)}`;
          const detailSlug = slugify(`${lessonTitle}-${faker.string.alphanumeric(4)}`);

          const detail = new ProductDetail();
          detail.title = lessonTitle;
          detail.slug = detailSlug;
          detail.content = faker.lorem.paragraphs(3);
          detail.videoUrl = faker.internet.url();
          detail.order = d;
          detail.isFreePreview = faker.datatype.boolean();
          detail.educator = educator;

          curriculum.push(detail);
        }

        // 📌 Create Product
        const product = productRepo.create({
          name: courseName,
          slug,
          shortDesc: faker.company.catchPhrase(),
          longDesc: faker.lorem.paragraphs(2),
          imageUrl: faker.image.urlLoremFlickr({ category: 'education' }),
          price: parseFloat(faker.commerce.price({ min: 200, max: 1500 })),
          isActive: true,
          educator,
          category,
          skills: selectedSkills,
          curriculum
        });

        allProductsToSave.push(product);
      }
    }

    // --- 4️⃣ Bulk Save All Products with Cascading Details ---
    await productRepo.save(allProductsToSave);

    console.log(`✅ Successfully seeded ${allProductsToSave.length} products with details!`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Connection closed.");
  }
}

seedProductsWithDetails();
