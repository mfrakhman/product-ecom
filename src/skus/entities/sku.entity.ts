import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Stock } from '../../stocks/entities/stock.entity';
import { Color } from '../../colors/entities/color.entity';
import { Size } from '../../sizes/entities/size.entity';

@Entity('skus')
export class Sku {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Product, (p) => p.skus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'color_id' })
  colorId!: string;

  @ManyToOne(() => Color, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'color_id' })
  color!: Color;

  @Column({ name: 'size_id', type: 'uuid', nullable: true })
  sizeId!: string | null;

  @ManyToOne(() => Size, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'size_id' })
  size!: Size | null;

  @Column({ unique: true })
  skuCode!: string;

  @Column()
  price!: number;

  @Column({ type: 'int', nullable: true })
  compareAt!: number | null;

  @Column({ default: true })
  isActive!: boolean;

  @OneToOne(() => Stock, (stock) => stock.sku)
  stock!: Stock;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
