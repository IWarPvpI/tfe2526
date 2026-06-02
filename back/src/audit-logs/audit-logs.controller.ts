import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: "Lister les logs d'audit" })
  findAll() { return this.auditLogsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un log" })
  findOne(@Param('id') id: string) { return this.auditLogsService.findOne(id); }

  @Post()
  @ApiOperation({ summary: "Créer un log" })
  create(@Body() body: any) { return this.auditLogsService.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: "Modifier un log" })
  update(@Param('id') id: string, @Body() body: any) { return this.auditLogsService.update(id, body); }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un log" })
  remove(@Param('id') id: string) { return this.auditLogsService.remove(id); }
}
