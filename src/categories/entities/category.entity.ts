import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => Category, (c) => c.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent!: Category | null;

  @OneToMany(() => Category, (c) => c.parent)
  children!: Category[];

  @OneToMany(() => Product, (p) => p.category)
  products!: Product[];

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ default: 0 })
  displayOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
