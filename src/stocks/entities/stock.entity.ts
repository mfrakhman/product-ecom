import { Sku } from 'src/skus/entities/sku.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint')
  amount: number;

  @OneToOne(() => Sku, (sku) => sku.stock, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sku_id' })
  sku: Sku;
}
