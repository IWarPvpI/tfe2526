import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: "Lister les factures" })
  findAll() { return this.invoicesService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une facture" })
  findOne(@Param('id') id: string) { return this.invoicesService.findOne(id); }

  @Post()
  @ApiOperation({ summary: "Créer une facture" })
  create(@Body() body: any) { return this.invoicesService.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour une facture" })
  update(@Param('id') id: string, @Body() body: any) { return this.invoicesService.update(id, body); }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer une facture" })
  remove(@Param('id') id: string) { return this.invoicesService.remove(id); }
}
