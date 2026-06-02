import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EnterprisesService } from './enterprises.service';

@ApiTags('Enterprises')
@Controller('enterprises')
export class EnterprisesController {
  constructor(private readonly enterprisesService: EnterprisesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les entreprises' })
  findAll() { return this.enterprisesService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Détails entreprise' })
  findOne(@Param('id') id: string) { return this.enterprisesService.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Créer une entreprise' })
  create(@Body() body: any) { return this.enterprisesService.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour' })
  update(@Param('id') id: string, @Body() body: any) { return this.enterprisesService.update(id, body); }
}
