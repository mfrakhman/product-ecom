import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Stock } from '../../stocks/entities/stock.entity';

@Entity()
export class Sku {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  skuCode: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  size: string;

  @Column({ type: 'text', nullable: true })
  color: string;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Product, (product) => product.skus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToOne(() => Stock, (stock) => stock.sku)
  stock: Stock;
}
