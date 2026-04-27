import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SizesRepository } from './repositories/sizes.repository';
import { CreateSizeDto } from './dtos/create-size.dto';
import { UpdateSizeDto } from './dtos/update-size.dto';

@Injectable()
export class SizesService {
  constructor(private readonly sizesRepository: SizesRepository) {}

  async findAll(sizeGroup?: string) {
    const sizes = await this.sizesRepository.findAll(sizeGroup);
    return { message: 'success', data: sizes };
  }

  async findById(id: string) {
    const size = await this.sizesRepository.findById(id);
    if (!size) throw new NotFoundException('Size not found');
    return { message: 'success', data: size };
  }

  async create(dto: CreateSizeDto) {
    try {
      const size = await this.sizesRepository.create({
        sizeGroup: dto.sizeGroup,
        name: dto.name,
        slug: dto.slug,
        sortOrder: dto.sortOrder,
      });
      return { message: 'Size created successfully', data: size };
    } catch {
      throw new ConflictException('Size with this sizeGroup + slug already exists');
    }
  }

  async update(id: string, dto: UpdateSizeDto) {
    const size = await this.sizesRepository.findById(id);
    if (!size) throw new NotFoundException('Size not found');
    await this.sizesRepository.update(id, dto);
    return { message: 'Size updated successfully' };
  }

  async delete(id: string) {
    const size = await this.sizesRepository.findById(id);
    if (!size) throw new NotFoundException('Size not found');
    await this.sizesRepository.delete(id);
    return { message: 'Size deleted successfully' };
  }
}
