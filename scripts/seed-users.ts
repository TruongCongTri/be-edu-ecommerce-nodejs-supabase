import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

import { AppDataSource } from "../src/data-source";
import { User } from "../src/database/entities/User";
import { StudentDetail } from "../src/database/entities/StudentDetail";
import { EducatorDetail } from "../src/database/entities/EducatorDetail";
import { UserRole } from "../constants/enum";

async function seedUsers() {
  try {
    console.log("🔗 Connecting to the database...");
    await AppDataSource.initialize();
    console.log("✅ Connected!");

    const userRepo = AppDataSource.getRepository(User);
    const studentDetailRepo = AppDataSource.getRepository(StudentDetail);
    const educatorDetailRepo = AppDataSource.getRepository(EducatorDetail);

    // Optional: Clear existing users (for full reseed)
    // await userRepo.clear();

    const PASSWORD = "password123";
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    const usersToInsert: User[] = [];

    // --- 1️⃣ Create Students (5) ---
    for (let i = 1; i <= 5; i++) {
      const user = userRepo.create({
        fullName: faker.person.fullName(),
        email: `student${i}@example.com`,
        passwordHash,
        role: UserRole.STUDENT,
      });
      usersToInsert.push(user);
    }

    // --- 2️⃣ Create Educators (5) ---
    for (let i = 1; i <= 5; i++) {
      const user = userRepo.create({
        fullName: faker.person.fullName(),
        email: `educator${i}@edu.com`,
        passwordHash,
        role: UserRole.EDUCATOR,
      });
      usersToInsert.push(user);
    }

    // --- 3️⃣ Create Admins (2) ---
    for (let i = 1; i <= 2; i++) {
      const user = userRepo.create({
        fullName: faker.person.fullName(),
        email: `admin${i}@admin.com`,
        passwordHash,
        role: UserRole.ADMIN,
      });
      usersToInsert.push(user);
    }

    // --- 4️⃣ Save Users ---
    const savedUsers = await userRepo.save(usersToInsert);
    console.log(`✅ Inserted ${savedUsers.length} users.`);

    // --- 5️⃣ Split by Role for details ---
    const studentUsers = savedUsers.filter(u => u.role === UserRole.STUDENT);
    const educatorUsers = savedUsers.filter(u => u.role === UserRole.EDUCATOR);

    // --- 6️⃣ Seed StudentDetails ---
    const studentDetails: StudentDetail[] = studentUsers.map(student => 
      studentDetailRepo.create({
        user: student,
        bio: faker.lorem.sentences(2),
      })
    );
    await studentDetailRepo.save(studentDetails);
    console.log(`✅ Inserted ${studentDetails.length} student details.`);

    // --- 7️⃣ Seed EducatorDetails ---
    const educatorDetails: EducatorDetail[] = educatorUsers.map(educator => 
      educatorDetailRepo.create({
        id: educator.id, // Uses same UUID as User
        user: educator,
        bio: faker.lorem.sentences(2),
        expertise: faker.helpers.arrayElement([
          "Web Development", "Data Science", "Digital Marketing",
          "Graphic Design", "Cybersecurity", "Finance", "Creative Writing"
        ]),
      })
    );
    await educatorDetailRepo.save(educatorDetails);
    console.log(`✅ Inserted ${educatorDetails.length} educator details.`);

    console.log("🌱 Seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding users:", err);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Connection closed.");
  }
}

seedUsers();
