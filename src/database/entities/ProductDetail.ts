import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@Entity("product_details")
export class ProductDetail {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "title" })
  title!: string;
  @Column({ name: "slug", unique: true })
  slug!: string;

  @Column({ name: "content", type: "text" })
  content!: string;

  @Column({ name: "video_url", nullable: true })
  videoUrl!: string;

  @Column({ name: "order" })
  order!: number;

  @Column({ name: "is_free_preview", default: false })
  isFreePreview!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // relation with product detail
  @Column({ name: "product_id", nullable: true })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.curriculum, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  // relation with educator
  @ManyToOne(() => User, (user) => user.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "educator_id" })
  educator!: User;
}
