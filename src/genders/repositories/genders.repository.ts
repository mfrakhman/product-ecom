import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from '../entities/gender.entity';

@Injectable()
export class GendersRepository {
  constructor(
    @InjectRepository(Gender)
    private readonly repo: Repository<Gender>,
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

  create(data: Partial<Gender>) {
    return this.repo.save(this.repo.create(data));
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
