import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryGroupsRepository } from './repositories/category-groups.repository';
import { CreateCategoryGroupDto } from './dtos/create-category-group.dto';

@Injectable()
export class CategoryGroupsService {
  constructor(private readonly repo: CategoryGroupsRepository) {}

  async findAll() {
    return { message: 'success', data: await this.repo.findAll() };
  }

  async create(dto: CreateCategoryGroupDto) {
    try {
      const group = await this.repo.create({ name: dto.name, slug: dto.slug, displayOrder: dto.displayOrder ?? 0 });
      return { message: 'Category group created successfully', data: group };
    } catch {
      throw new ConflictException('Category group slug already exists');
    }
  }

  async delete(id: string) {
    const group = await this.repo.findById(id);
    if (!group) throw new NotFoundException('Category group not found');
    await this.repo.delete(id);
    return { message: 'Category group deleted successfully' };
  }
}
