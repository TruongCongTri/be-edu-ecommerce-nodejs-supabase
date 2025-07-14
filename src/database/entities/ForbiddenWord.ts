import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("forbidden_words")
@Unique(["word"])
export class ForbiddenWord {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  word!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
