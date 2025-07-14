import { AppDataSource } from "../src/data-source";
import { AllowedOrigin } from "../src/database/entities/AllowedOrigin";

async function seedAllowedOrigins() {
  try {
    console.log("🔗 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Connected!");

    const repo = AppDataSource.getRepository(AllowedOrigin);

    // Optional: clear existing
    await repo.clear();
    console.log("🧹 Cleared existing AllowedOrigins");

    // Define the allowed origins you want
    const origins = [
      "http://localhost:3000",
      "https://admin.yourplatform.com",
      "https://app.yourplatform.com",
      "https://partner.yourplatform.com",
    ];

    const toInsert = origins.map(origin =>
      repo.create({
        origin,
      })
    );

    await repo.save(toInsert);

    console.log(`✅ Successfully seeded ${toInsert.length} allowed origins!`);
  } catch (error) {
    console.error("❌ Error seeding AllowedOrigins:", error);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Connection closed.");
  }
}

seedAllowedOrigins();
