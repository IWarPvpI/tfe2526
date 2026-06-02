import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: "Lister les adresses" })
  findAll() { return this.addressesService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une adresse" })
  findOne(@Param('id') id: string) { return this.addressesService.findOne(id); }

  @Post()
  @ApiOperation({ summary: "Ajouter une adresse" })
  create(@Body() body: any) { return this.addressesService.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour une adresse" })
  update(@Param('id') id: string, @Body() body: any) { return this.addressesService.update(id, body); }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer une adresse" })
  remove(@Param('id') id: string) { return this.addressesService.remove(id); }
}
