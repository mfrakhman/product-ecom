import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sku } from '../../skus/entities/sku.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductColorImage } from './product-color-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => Category, (c) => c.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  // 'apparel' | 'footwear_uk' | 'waist' | null (bags, accessories)
  @Column({ type: 'text', nullable: true })
  sizeGroup!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Sku, (sku) => sku.product)
  skus!: Sku[];

  @OneToMany(() => ProductColorImage, (img) => img.product)
  images!: ProductColorImage[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
