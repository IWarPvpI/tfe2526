import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { ConfirmDemandeDto } from './dto/confirm-demande.dto';

@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('quote')
  @ApiOperation({ summary: 'Obtenir un tarif FedEx' })
  async getQuote(@Body() data: any) {
    return this.requestsService.create(data);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmer une demande de transport' })
  async confirm(@Body() dto: ConfirmDemandeDto) {
    return this.requestsService.confirm(dto);
  }

  @Post('validate-address')
  @ApiOperation({ summary: 'Valider une adresse auprès de FedEx Address Validation API' })
  async validateAddress(@Body() addressData: any) {
    return this.requestsService.validateAddress(addressData);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les demandes et expéditions' })
  async findAll() {
    return this.requestsService.findAll();
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Suivi en temps réel auprès de FedEx Track API' })
  async trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.requestsService.trackShipment(trackingNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir le détail d\'une demande' })
  async findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }
}
