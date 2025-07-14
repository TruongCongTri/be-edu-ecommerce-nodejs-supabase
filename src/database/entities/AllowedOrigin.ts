import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("allowed_origins")
export class AllowedOrigin {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  origin!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
