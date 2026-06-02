import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: "Lister les paiements" })
  findAll() { return this.paymentsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un paiement" })
  findOne(@Param('id') id: string) { return this.paymentsService.findOne(id); }

  @Post()
  @ApiOperation({ summary: "Créer un paiement" })
  create(@Body() body: any) { return this.paymentsService.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour un paiement" })
  update(@Param('id') id: string, @Body() body: any) { return this.paymentsService.update(id, body); }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un paiement" })
  remove(@Param('id') id: string) { return this.paymentsService.remove(id); }
}
