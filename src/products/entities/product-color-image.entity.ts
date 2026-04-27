import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Color } from '../../colors/entities/color.entity';

@Entity('product_color_images')
@Index(['productId', 'colorId'])
export class ProductColorImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'color_id' })
  colorId!: string;

  @ManyToOne(() => Color, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'color_id' })
  color!: Color;

  @Column()
  imageUrl!: string;

  @Column({ type: 'text', nullable: true })
  altText!: string | null;

  @Column({ type: 'text', nullable: true })
  imageObject!: string | null;

  @Column({ default: 0 })
  displayOrder!: number;
}
