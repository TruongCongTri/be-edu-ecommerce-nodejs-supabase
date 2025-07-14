import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Category } from "./Category";
import { Skill } from "./Skill";
import { User } from "./User";
import { ProductDetail } from "./ProductDetail";
import { ViewHistory } from "./ViewHistory";
import { Favorite } from "./Favorite";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "name" })
  name!: string;
  @Column({ name: "slug", unique: true })
  slug!: string;

  @Column({ name: "short_desc" })
  shortDesc!: string;
  @Column({ name: "long_desc", type: "text" })
  longDesc!: string;

  @Column({ name: "image_url" })
  imageUrl!: string;

  @Column({ name: "price", type: "decimal", nullable: true })
  price?: number;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  // relation with educator
  @ManyToOne(() => User, (user) => user.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "educator_id" })
  educator!: User;

  // relation with product details
  @OneToMany(() => ProductDetail, (detail) => detail.product, { cascade: true })
  curriculum!: ProductDetail[];

  // relation with category
  @Column({ name: "category_id", nullable: true })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "category_id" })
  category!: Category;

  // relation with skills
  @ManyToMany(() => Skill, skill => skill.products)
  @JoinTable({
    name: "product_skills",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "skill_id", referencedColumnName: "id" },
  })
  skills!: Skill[];

  // relation with view history
  @OneToMany(() => ViewHistory, (history) => history.product)
  viewHistory!: ViewHistory[];

  // relation with favorites
  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites!: Favorite[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
