import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll(where?: Partial<Pick<Category, 'genderId' | 'groupId'>>) {
    return this.repo.find({
      where,
      relations: ['gender', 'group'],
      order: { displayOrder: 'ASC' },
    });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['gender', 'group'] });
  }

  findBySlug(slug: string) {
    return this.repo.findOne({ where: { slug }, relations: ['gender', 'group'] });
  }

  create(data: Partial<Category>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: string, data: Partial<Category>) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
