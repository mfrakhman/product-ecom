import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GendersRepository } from './repositories/genders.repository';
import { CreateGenderDto } from './dtos/create-gender.dto';

@Injectable()
export class GendersService {
  constructor(private readonly repo: GendersRepository) {}

  async findAll() {
    return { message: 'success', data: await this.repo.findAll() };
  }

  async create(dto: CreateGenderDto) {
    try {
      const gender = await this.repo.create({ name: dto.name, slug: dto.slug, displayOrder: dto.displayOrder ?? 0 });
      return { message: 'Gender created successfully', data: gender };
    } catch {
      throw new ConflictException('Gender slug already exists');
    }
  }

  async delete(id: string) {
    const gender = await this.repo.findById(id);
    if (!gender) throw new NotFoundException('Gender not found');
    await this.repo.delete(id);
    return { message: 'Gender deleted successfully' };
  }
}
