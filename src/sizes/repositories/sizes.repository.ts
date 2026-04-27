import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Size } from '../entities/size.entity';

@Injectable()
export class SizesRepository {
  constructor(
    @InjectRepository(Size)
    private readonly repo: Repository<Size>,
  ) {}

  findAll(sizeGroup?: string) {
    return this.repo.find({
      where: sizeGroup ? { sizeGroup } : {},
      order: { sizeGroup: 'ASC', sortOrder: 'ASC' },
    });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Size>) {
    const size = this.repo.create(data);
    return this.repo.save(size);
  }

  update(id: string, data: Partial<Size>) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
