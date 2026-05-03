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
import { Gender } from '../../genders/entities/gender.entity';
import { CategoryGroup } from '../../category-groups/entities/category-group.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'gender_id', type: 'uuid' })
  genderId!: string;

  @ManyToOne(() => Gender, (g) => g.categories, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'gender_id' })
  gender!: Gender;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @ManyToOne(() => CategoryGroup, (g) => g.categories, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'group_id' })
  group!: CategoryGroup;

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
