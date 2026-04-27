import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findTree() {
    const all = await this.categoriesRepository.findAll();
    return { message: 'success', data: this.buildTree(all) };
  }

  async findById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return { message: 'success', data: category };
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.categoriesRepository.findById(dto.parentId);
      if (!parent) throw new NotFoundException('Parent category not found');
    }
    try {
      const category = await this.categoriesRepository.create({
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId ?? null,
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
    if (dto.parentId === id)
      throw new BadRequestException('Category cannot be its own parent');
    await this.categoriesRepository.update(id, dto);
    return { message: 'Category updated successfully' };
  }

  async delete(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    const childCount = await this.categoriesRepository.countChildren(id);
    if (childCount > 0)
      throw new BadRequestException('Cannot delete a category that has children');
    await this.categoriesRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }

  private buildTree(categories: Category[]) {
    const map = new Map(
      categories.map((c) => ({ ...c, children: [] as any[] })).map((c) => [c.id, c]),
    );
    const roots: any[] = [];
    for (const cat of map.values()) {
      if (cat.parentId) {
        map.get(cat.parentId)?.children.push(cat);
      } else {
        roots.push(cat);
      }
    }
    return roots;
  }
}
