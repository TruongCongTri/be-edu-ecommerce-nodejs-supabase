import { AppDataSource } from "../src/data-source";
import { User } from "../src/database/entities/User";
import { Product } from "../src/database/entities/Product";
import { Favorite } from "../src/database/entities/Favorite";
import { UserRole } from "../constants/enum";
import { faker } from "@faker-js/faker";

async function seedFavorites() {
  try {
    console.log("🔗 Connecting to DB...");
    await AppDataSource.initialize();
    console.log("✅ Connected!");

    const userRepo = AppDataSource.getRepository(User);
    const productRepo = AppDataSource.getRepository(Product);
    const favoriteRepo = AppDataSource.getRepository(Favorite);

    // Optional: clear existing
    await favoriteRepo.clear();
    console.log("🧹 Cleared existing Favorites.");

    // Load Students
    const students = await userRepo.find({
      where: { role: UserRole.STUDENT },
    });
    if (!students.length) throw new Error("❌ No students found.");

    // Load Products
    const products = await productRepo.find();
    if (!products.length) throw new Error("❌ No products found.");

    const toInsert: Favorite[] = [];

    for (const student of students) {
      // Random number of favorites per student
      const favCount = faker.number.int({ min: 3, max: 5 });

      // Pick random products without repeats
      const favProducts = faker.helpers.arrayElements(products, favCount);

      for (const product of favProducts) {
        const favorite = favoriteRepo.create({
          user: student,
          product,
        });
        toInsert.push(favorite);
      }
    }

    await favoriteRepo.save(toInsert);
    console.log(`✅ Seeded ${toInsert.length} favorites!`);
  } catch (err) {
    console.error("❌ Error seeding favorites:", err);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Connection closed.");
  }
}

seedFavorites();
