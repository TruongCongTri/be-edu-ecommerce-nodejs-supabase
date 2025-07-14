import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("educator_details")
export class EducatorDetail {
  @PrimaryColumn("uuid")
  id!: string;

  @OneToOne(() => User, (user) => user.educatorDetail, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ nullable: true, type: "text" })
  bio!: string;

  @Column({ nullable: true })
  expertise!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
