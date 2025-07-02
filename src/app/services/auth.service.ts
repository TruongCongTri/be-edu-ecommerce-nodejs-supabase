import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { authRepository } from "../repositories/auth.repository";
import { User } from "../../database/entities/User";
import { AppError } from "../../../utils/errors/AppError";
import { UserRole } from "../../../constants/enum";
import { RegisterDto } from "../../database/dtos/Register.dto";
import { LoginDto } from "../../database/dtos/Login.dto";
import { ValidateIdDto } from "../../database/dtos/ValidateId.dto";
import { ChangePasswordDto } from "../../database/dtos/ChangePassword.dto";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key";
const JWT_EXPIRES_IN: `${number}${"s" | "m" | "h" | "d"}` = (process.env
  .JWT_EXPIRES_IN || "7d") as `${number}${"s" | "m" | "h" | "d"}`;
const DEFAULT_SALT_ROUNDS = 10;

export class AuthService {
  // private authRepo = authRepository;
  // constructor() {}

  // Service is injected via constructor
  constructor(private authRepo = authRepository) {}

  // service layers should usually work with already validated primitive values, not DTO wrappers.

  /**
   * Registers a new user with a specified role.
   * @param dto Registration data (fullName, email, password, phoneNumber).
   * @param role The role to assign to the new user (e.g., UserRole.JOB_SEEKER).
   * @returns The newly created User entity.
   */
  register = async (dto: RegisterDto, role: UserRole): Promise<User> => {
    // 1. Check if email already exists
    const existing = await this.authRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new AppError("Email already exists", 409);

    // 2. Hash the password
    let saltRounds: number;
    try {
      // Ensure BYCRYPT_SALT is a valid number; fallback to default if not.
      const envSalt = process.env.BYCRYPT_SALT;
      saltRounds = envSalt ? parseInt(envSalt, 10) : DEFAULT_SALT_ROUNDS;
      if (isNaN(saltRounds) || saltRounds < 1) {
        // Ensure salt rounds is a positive number
        console.warn(
          `Invalid BYCRYPT_SALT environment variable. Using default ${DEFAULT_SALT_ROUNDS} rounds.`
        );
        saltRounds = DEFAULT_SALT_ROUNDS;
      }
    } catch (e) {
      console.error("Error parsing BYCRYPT_SALT, using default:", e);
      saltRounds = DEFAULT_SALT_ROUNDS;
    }

    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Create a new User entity instance
    const newUser = this.authRepo.create({
      ...dto, // Spreads fullName, email, phoneNumber
      role, // Assign the specified role
      password: hashedPassword, // Assign the hashed password
    });

    // 4. Save the new user to the database
    // The `save` method will return the saved entity, which is what RegisterOutputDto expects.
    return await this.authRepo.save(newUser);
  };

  login = async (dto: LoginDto): Promise<{ token: string }> => {
    // 1. Find user by email
    const user = await this.authRepo.findOne({
      where: { email: dto.email },
      select: ["id", "email", "password", "role"], // Explicitly select password for comparison
    });
    if (!user) throw new AppError("Invalid credentials", 401);

    // 2. Compare provided password with hashed password from database
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", 401);

    // 3. Generate JWT token
    // Ensure `user.role` property exists on your User entity
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Payload: user ID and role
      JWT_SECRET, // Secret key
      { expiresIn: JWT_EXPIRES_IN }
    ); // Token expiration

    // 4. Return the token
    return { token };
  };

  changePassword = async (
    userId: string,
    dto: ChangePasswordDto
  ): Promise<void> => {
    // 1. Find the user by ID.
    // Ensure 'password' is selected as it's needed for comparison.
    const user = await this.authRepo.findOne({
      where: { id: userId }, 
      select: ["id", "email", "password", "role"], // Crucial: Select password explicitly 
    });
    // If user not found (shouldn't happen if auth middleware works, but good to check)
    if (!user) throw new AppError("User not found", 404);

    // 2. Verify the current password.
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new AppError("Current password is incorrect", 401);
    
    // 3. Hash the new password.
    let saltRounds: number;
    try {
      const envSalt = process.env.BYCRYPT_SALT;
      saltRounds = envSalt ? parseInt(envSalt, 10) : DEFAULT_SALT_ROUNDS;
      if (isNaN(saltRounds) || saltRounds < 1) {
        console.warn(`Invalid BYCRYPT_SALT environment variable. Using default ${DEFAULT_SALT_ROUNDS} rounds.`);
        saltRounds = DEFAULT_SALT_ROUNDS;
      }
    } catch (e) {
      console.error("Error parsing BYCRYPT_SALT, using default:", e);
      saltRounds = DEFAULT_SALT_ROUNDS;
    }
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    // 4. Update the user's password and save.
    user.password = hashedNewPassword;

    await this.authRepo.save(user);
  };
}
