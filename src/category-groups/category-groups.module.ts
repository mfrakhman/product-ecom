import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryGroup } from './entities/category-group.entity';
import { CategoryGroupsRepository } from './repositories/category-groups.repository';
import { CategoryGroupsService } from './category-groups.service';
import { CategoryGroupsController } from './category-groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryGroup])],
  controllers: [CategoryGroupsController],
  providers: [CategoryGroupsService, CategoryGroupsRepository],
  exports: [CategoryGroupsRepository],
})
export class CategoryGroupsModule {}
