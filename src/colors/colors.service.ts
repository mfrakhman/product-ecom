import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ColorsRepository } from './repositories/colors.repository';
import { CreateColorDto } from './dtos/create-color.dto';
import { UpdateColorDto } from './dtos/update-color.dto';

@Injectable()
export class ColorsService {
  constructor(private readonly colorsRepository: ColorsRepository) {}

  async findAll() {
    const colors = await this.colorsRepository.findAll();
    return { message: 'success', data: colors };
  }

  async findById(id: string) {
    const color = await this.colorsRepository.findById(id);
    if (!color) throw new NotFoundException('Color not found');
    return { message: 'success', data: color };
  }

  async create(dto: CreateColorDto) {
    try {
      const color = await this.colorsRepository.create({
        name: dto.name,
        slug: dto.slug,
        hex: dto.hex,
        displayOrder: dto.displayOrder ?? 0,
      });
      return { message: 'Color created successfully', data: color };
    } catch {
      throw new ConflictException('Color name or slug already exists');
    }
  }

  async update(id: string, dto: UpdateColorDto) {
    const color = await this.colorsRepository.findById(id);
    if (!color) throw new NotFoundException('Color not found');
    await this.colorsRepository.update(id, dto);
    return { message: 'Color updated successfully' };
  }

  async delete(id: string) {
    const color = await this.colorsRepository.findById(id);
    if (!color) throw new NotFoundException('Color not found');
    await this.colorsRepository.delete(id);
    return { message: 'Color deleted successfully' };
  }
}
