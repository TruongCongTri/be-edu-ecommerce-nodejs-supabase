import { AppDataSource } from "../src/data-source";
import { User } from "../src/database/entities/User";
import { Product } from "../src/database/entities/Product";
import { ViewHistory } from "../src/database/entities/ViewHistory";
import { UserRole } from "../constants/enum";
import { faker } from "@faker-js/faker";

async function seedViewHistory() {
  try {
    console.log("🔗 Connecting to DB...");
    await AppDataSource.initialize();
    console.log("✅ Connected!");

    const userRepo = AppDataSource.getRepository(User);
    const productRepo = AppDataSource.getRepository(Product);
    const viewHistoryRepo = AppDataSource.getRepository(ViewHistory);

    // Optional: clear existing
    await viewHistoryRepo.clear();
    console.log("🧹 Cleared existing ViewHistory records.");

    // Load Students
    const students = await userRepo.find({
      where: { role: UserRole.STUDENT },
    });
    if (!students.length) throw new Error("❌ No students found.");

    // Load Products
    const products = await productRepo.find();
    if (!products.length) throw new Error("❌ No products found.");

    const toInsert: ViewHistory[] = [];

    for (const student of students) {
      // Random number of views per student
      const viewsCount = faker.number.int({ min: 5, max: 10 });

      // Pick random products without repeats
      const viewedProducts = faker.helpers.arrayElements(products, viewsCount);

      for (const product of viewedProducts) {
        const history = viewHistoryRepo.create({
          user: student,
          product,
          viewedAt: faker.date.recent({ days: 30 }),
        });
        toInsert.push(history);
      }
    }

    await viewHistoryRepo.save(toInsert);
    console.log(`✅ Seeded ${toInsert.length} view history records!`);
  } catch (err) {
    console.error("❌ Error seeding view history:", err);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Connection closed.");
  }
}

seedViewHistory();
