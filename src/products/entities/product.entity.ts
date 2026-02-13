import { Sku } from '../../skus/entities/sku.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Category {
  BAGS = 'BAGS',
  SHOES = 'SHOES',
  CLOTHES = 'CLOTHES',
  PANTS = 'PANTS',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: Category })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Sku, (sku) => sku.product)
  skus: Sku[];
}
