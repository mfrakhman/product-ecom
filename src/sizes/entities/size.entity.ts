import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('sizes')
@Unique(['sizeGroup', 'slug'])
export class Size {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 'apparel' | 'footwear_uk' | 'waist'
  @Column()
  sizeGroup!: string;

  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column()
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
