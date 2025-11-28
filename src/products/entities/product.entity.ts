import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column('bigint')
  price: number;

  @Column({ default: 0, type: 'int' })
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
