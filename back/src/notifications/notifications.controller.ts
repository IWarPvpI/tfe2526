import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Lister les notifications" })
  findAll() { return this.notificationsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une notification" })
  findOne(@Param('id') id: string) { return this.notificationsService.findOne(id); }

  @Post()
  @ApiOperation({ summary: "Créer une notification" })
  create(@Body() body: any) { return this.notificationsService.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour" })
  update(@Param('id') id: string, @Body() body: any) { return this.notificationsService.update(id, body); }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer une notification" })
  remove(@Param('id') id: string) { return this.notificationsService.remove(id); }
}
