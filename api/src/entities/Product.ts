import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductSituation } from "./ProductSituation";
import { ProductCategory } from "./ProductCategory";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  productSituationId!: number;

  @ManyToOne(() => ProductSituation, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "productSituationId" })
  productSituation!: ProductSituation;

  @Column()
  productCategoryId!: number;

  @ManyToOne(() => ProductCategory, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "productCategoryId" })
  productCategory!: ProductCategory;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
