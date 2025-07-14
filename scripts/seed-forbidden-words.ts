import { AppDataSource } from "../src/data-source";
import { ForbiddenWord } from "../src/database/entities/ForbiddenWord";

async function seedForbiddenWords() {
  try {
    console.log("🔗 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Connected!");

    const repo = AppDataSource.getRepository(ForbiddenWord);

    // Optional: clear existing
    await repo.clear();
    console.log("🧹 Cleared existing ForbiddenWords");

    // Define the words you want to ban
    const words = [
      "badword1",
      "forbiddenterm",
      "spammy",
      "offensive1",
      "abusive2",
      "harassment",
      "hate speech",
      "explicit",
      "violent threat",
      "slur1",
    ];

    const toInsert = words.map(word =>
      repo.create({
        word,
      })
    );

    await repo.save(toInsert);

    console.log(`✅ Successfully seeded ${toInsert.length} forbidden words!`);
  } catch (error) {
    console.error("❌ Error seeding ForbiddenWords:", error);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Connection closed.");
  }
}

seedForbiddenWords();
