import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: "Lister les contacts" })
  findAll() { return this.contactsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un contact" })
  findOne(@Param('id') id: string) { return this.contactsService.findOne(id); }

  @Post()
  @ApiOperation({ summary: "Créer un contact" })
  create(@Body() body: any) { return this.contactsService.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour un contact" })
  update(@Param('id') id: string, @Body() body: any) { return this.contactsService.update(id, body); }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer un contact" })
  remove(@Param('id') id: string) { return this.contactsService.remove(id); }
}
