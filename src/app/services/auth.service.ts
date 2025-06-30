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

export class AuthService {
  private authRepo = authRepository;

  constructor() {}

  // service layers should usually work with already validated primitive values, not DTO wrappers.

  register = async (dto: RegisterDto, role: UserRole): Promise<User> => {
    const existing = await this.authRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new AppError("Email already exists", 409);

    const hashedPassword = await bcrypt.hash(
      dto.password!,
      Number(process.env.BYCRYPT_SALT)
    );

    const newUser = this.authRepo.create({
      ...dto,
      role,
      password: hashedPassword,
    });

    return await this.authRepo.save(newUser);
  };

  login = async (dto: LoginDto): Promise<{ token: string }> => {
    const user = await this.authRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", 401);

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { token };
  };

  changePassword = async (
    userId: string,
    dto: ChangePasswordDto
  ): Promise<void> => {
    const user = await this.authRepo.findOne({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new AppError("Current password is incorrect", 401);

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashed;

    await this.authRepo.save(user);
  };
}
