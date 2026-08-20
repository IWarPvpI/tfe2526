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

  @Post('create-checkout-session')
  @ApiOperation({ summary: "Créer une session de paiement Stripe Checkout" })
  createCheckoutSession(@Body() body: { invoiceId: string; amount?: number }) {
    return this.paymentsService.createCheckoutSession(body.invoiceId, body.amount);
  }

  @Get('verify/:sessionId')
  @ApiOperation({ summary: "Vérifier le statut d'un paiement Stripe" })
  verifySession(@Param('sessionId') sessionId: string) {
    return this.paymentsService.verifySession(sessionId);
  }

  @Post('webhook')
  @ApiOperation({ summary: "Webhook Stripe" })
  webhook(@Body() body: any) {
    return this.paymentsService.webhook(body);
  }

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
