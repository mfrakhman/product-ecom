import { Sku } from 'src/skus/entities/sku.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

const bigintTransformer = {
  to: (v: number) => v,
  from: (v: string) => parseInt(v, 10),
};

@Entity()
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('bigint', { transformer: bigintTransformer })
  amount!: number;

  @Column('bigint', { transformer: bigintTransformer, default: 0 })
  reserved!: number;

  @OneToOne(() => Sku, (sku) => sku.stock, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sku_id' })
  sku!: Sku;
}
