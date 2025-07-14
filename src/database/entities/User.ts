import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from "typeorm";

import { Exclude } from "class-transformer";
import { UserRole } from "../../../constants/enum";
import { StudentDetail } from "./StudentDetail";
import { EducatorDetail } from "./EducatorDetail";
import { Product } from "./Product";
import { ViewHistory } from "./ViewHistory";
import { Favorite } from "./Favorite";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "full_name" })
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: "password_hash" })
  @Exclude() // hide from output
  passwordHash!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.STUDENT })
  role!: UserRole;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToOne(() => StudentDetail, detail => detail.user)
  studentDetail?: StudentDetail;

  @OneToOne(() => EducatorDetail, detail => detail.user)
  educatorDetail?: EducatorDetail;

  @OneToMany(() => Product, product => product.educator)
  products?: Product[];

  @OneToMany(() => ViewHistory, history => history.user)
  viewHistory!: ViewHistory[];

  @OneToMany(() => Favorite, favorite => favorite.user)
  favorites!: Favorite[];
}
