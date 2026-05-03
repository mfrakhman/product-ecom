import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryGroup } from '../entities/category-group.entity';

@Injectable()
export class CategoryGroupsRepository {
  constructor(
    @InjectRepository(CategoryGroup)
    private readonly repo: Repository<CategoryGroup>,
  ) {}

  findAll() {
    return this.repo.find({ order: { displayOrder: 'ASC' } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.repo.findOne({ where: { slug } });
  }

  create(data: Partial<CategoryGroup>) {
    return this.repo.save(this.repo.create(data));
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
