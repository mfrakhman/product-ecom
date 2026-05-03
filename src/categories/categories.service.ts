import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(genderId?: string, groupId?: string) {
    const where: any = {};
    if (genderId) where.genderId = genderId;
    if (groupId) where.groupId = groupId;
    return { message: 'success', data: await this.categoriesRepository.findAll(where) };
  }

  async findById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return { message: 'success', data: category };
  }

  async create(dto: CreateCategoryDto) {
    try {
      const category = await this.categoriesRepository.create({
        name: dto.name,
        slug: dto.slug,
        genderId: dto.genderId,
        groupId: dto.groupId,
        displayOrder: dto.displayOrder ?? 0,
      });
      return { message: 'Category created successfully', data: category };
    } catch {
      throw new ConflictException('Category slug already exists');
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    await this.categoriesRepository.update(id, dto);
    return { message: 'Category updated successfully' };
  }

  async delete(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    await this.categoriesRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }
}
