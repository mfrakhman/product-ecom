import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CategoryGroupsService } from './category-groups.service';
import { CreateCategoryGroupDto } from './dtos/create-category-group.dto';

@Controller('category-groups')
export class CategoryGroupsController {
  constructor(private readonly categoryGroupsService: CategoryGroupsService) {}

  @Get()
  findAll() {
    return this.categoryGroupsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCategoryGroupDto) {
    return this.categoryGroupsService.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoryGroupsService.delete(id);
  }
}
