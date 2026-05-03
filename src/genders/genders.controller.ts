import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GendersService } from './genders.service';
import { CreateGenderDto } from './dtos/create-gender.dto';

@Controller('genders')
export class GendersController {
  constructor(private readonly gendersService: GendersService) {}

  @Get()
  findAll() {
    return this.gendersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateGenderDto) {
    return this.gendersService.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.gendersService.delete(id);
  }
}
