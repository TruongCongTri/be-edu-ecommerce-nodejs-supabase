import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { authRepository } from "../repositories/auth.repository";
import { User } from "../../database/entities/User";
import { AppError } from "../../../utils/errors/AppError";
import { UserRole } from "../../../constants/enum";

import { LoginDto } from "../../database/dtos/Login.dto";
import { CreateUserDto } from "../../database/dtos/create-user.dto";
import { ChangePasswordDto } from "../../database/dtos/change-password.dto";

import { RegisterOutputDto } from "../../database/dtos.output/RegisterOutput.dto";
import { LoginOutputDto } from "../../database/dtos.output/LoginOutput.dto";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key";
const JWT_EXPIRES_IN: `${number}${"s" | "m" | "h" | "d"}` = (process.env
  .JWT_EXPIRES_IN || "7d") as `${number}${"s" | "m" | "h" | "d"}`;
const DEFAULT_SALT_ROUNDS = 10;

export class AuthService {
  // private authRepo = authRepository;
  // constructor() {}

  // Service is injected via constructor
  constructor(private authRepo = authRepository) {}

  /**
   * Private helper to get the salt rounds for bcrypt.
   */
  private getSaltRounds = (): number => {
    let saltRounds: number;
    try {
      const envSalt = process.env.BYCRYPT_SALT;
      saltRounds = envSalt ? parseInt(envSalt, 10) : DEFAULT_SALT_ROUNDS;
      if (isNaN(saltRounds) || saltRounds < 1) {
        console.warn(
          `Invalid BYCRYPT_SALT environment variable. Using default ${DEFAULT_SALT_ROUNDS} rounds.`
        );
        saltRounds = DEFAULT_SALT_ROUNDS;
      }
    } catch (e) {
      console.error("Error parsing BYCRYPT_SALT, using default:", e);
      saltRounds = DEFAULT_SALT_ROUNDS;
    }
    return saltRounds;
  };

  /**
   * Private helper to find a user by email, optionally selecting password.
   * Returns the User entity or null.
   */
  private getUserByEmailEntity = async (
    email: string,
    selectPassword: boolean = false
  ): Promise<User> => {
    const selectOptions: Array<keyof User> = [
      "id",
      "email",
      "role",
      "fullName",
      // "phoneNumber",
    ];
    if (selectPassword) {
      selectOptions.push("passwordHash");
    }
    const user = await this.authRepo.findOne({
      where: { email },
      select: selectOptions,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  };

  /**
   * Private helper to find a user by ID, optionally selecting password.
   * Returns the User entity or null.
   */
  private getUserByIdEntity = async (
    userId: string,
    selectPassword: boolean = false
  ): Promise<User> => {
    const selectOptions: Array<keyof User> = [
      "id",
      "email",
      "role",
      "fullName",
    ];
    if (selectPassword) {
      selectOptions.push("passwordHash");
    }

    const user = await this.authRepo.findOne({
      where: { id: userId },
      select: selectOptions,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  };
  // service layers should usually work with already validated primitive values, not DTO wrappers.

  /**
   * Registers a new user with a specified role.
   * @param dto Registration data (fullName, email, password, phoneNumber).
   * @param role The role to assign to the new user (e.g., UserRole.JOB_SEEKER).
   * @returns The newly created User entity.
   */
  register = async (dto: CreateUserDto, role: UserRole): Promise<RegisterOutputDto> => {
    // 1. Check if email already exists
    const existing = await this.authRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new AppError("Email already exists", 409);

    // 2. Hash the password
    const saltRounds = this.getSaltRounds();
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Create a new User entity instance
    const newUser = this.authRepo.create({
      ...dto, // Spreads fullName, email, phoneNumber
      role, // Assign the specified role
      passwordHash: hashedPassword, // Assign the hashed password
    });

    // --- BLOCK 4: Save the new user to the database ---
    const createdAccount = await this.authRepo.save(newUser);

    // --- BLOCK 5: Map Entities to DTOs ---
    const accountDto = RegisterOutputDto.fromEntity(createdAccount);

    // --- BLOCK 6: Return Data ---
    return accountDto;
  };

  /**
   * Logs in a user and returns a JWT token.
   * @param dto The login credentials.
   * @returns An object containing the JWT token.
   */
  login = async (dto: LoginDto): Promise<LoginOutputDto> => {
    // 1. Find user by email
    const user = await this.getUserByEmailEntity(dto.email, true); // true to select password

    // 2. Compare provided password with hashed password from database
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new AppError("email or password is incorrect", 401);

    // 3. Generate JWT token
    // Ensure `user.role` property exists on your User entity
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Payload: user ID and role
      JWT_SECRET, // Secret key
      { expiresIn: JWT_EXPIRES_IN }
    ); // Token expiration

    const loginData = LoginOutputDto.fromData(token);

    // 4. Return the token
    return loginData;
  };

  /**
   * Allows a user to change their password.
   * @param userId The ID of the authenticated user.
   * @param dto The change password data (current and new passwords).
   * @returns void
   */
  changePassword = async (
    userId: string,
    dto: ChangePasswordDto
  ): Promise<void> => {
    // 1. Find the user by ID, explicitly selecting password for comparison.
    const user = await this.getUserByIdEntity(userId, true); // true to select password

    // 2. Verify the current password.
    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) throw new AppError("Current password is incorrect", 401);

    // 3. Hash the new password.
    const saltRounds = this.getSaltRounds();
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    // 4. Update the user's password and save.
    user.passwordHash = hashedNewPassword;

    await this.authRepo.save(user);
  };
}
