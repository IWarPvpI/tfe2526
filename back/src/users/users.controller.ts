import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les utilisateurs' })
  findAll() { return { message: 'Not implemented' }; }

  @Get(':id')
  @ApiOperation({ summary: 'Détails utilisateur' })
  findOne(@Param('id') id: string) { return { message: 'Not implemented' }; }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  update(@Param('id') id: string, @Body() body: any) { return { message: 'Not implemented' }; }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  remove(@Param('id') id: string) { return { message: 'Not implemented' }; }
}
