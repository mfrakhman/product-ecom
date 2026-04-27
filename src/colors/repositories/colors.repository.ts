import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from '../entities/color.entity';

@Injectable()
export class ColorsRepository {
  constructor(
    @InjectRepository(Color)
    private readonly repo: Repository<Color>,
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

  create(data: Partial<Color>) {
    const color = this.repo.create(data);
    return this.repo.save(color);
  }

  update(id: string, data: Partial<Color>) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
