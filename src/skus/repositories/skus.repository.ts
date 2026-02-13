import { Injectable } from '@nestjs/common';
import { EntityManager, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Sku } from '../entities/sku.entity';

@Injectable()
export class SkusRepository {
  constructor(
    @InjectRepository(Sku)
    private readonly skuRepository: Repository<Sku>,
  ) {}

  create(sku: Partial<Sku>) {
    const newSku = this.skuRepository.create(sku);
    return this.skuRepository.save(newSku);
  }

  createWithManager(sku: Partial<Sku>, manager: EntityManager) {
    const newSku = manager.create(Sku, sku);
    return manager.save(newSku);
  }

  findById(id: string) {
    return this.skuRepository.findOne({
      where: { id },
      relations: ['product', 'stock'],
    });
  }

  findByCode(skuCode: string) {
    return this.skuRepository.findOne({ where: { skuCode } });
  }

  findAll() {
    return this.skuRepository.find();
  }

  update(id: string, updateData: Partial<Sku>) {
    return this.skuRepository.update(id, updateData);
  }

  delete(id: string) {
    return this.skuRepository.delete(id);
  }

  async findActiveIdsByIds(ids: string[]) {
    return this.skuRepository.find({
      select: ['id'],
      where: { id: In(ids), isActive: true },
    });
  }
}
