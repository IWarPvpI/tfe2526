import { Injectable, UseGuards} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {Roles} from "../auth/decorators/roles.decorator";

@UseGuards(JwtAuthGuard)
@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) 
    private readonly invoiceRepo: Repository<Invoice>
  ) {}

  @Roles('admin')
  async findAll() {
    return this.invoiceRepo.find({
      relations: { user: true, request: true },
      order: { issuedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.invoiceRepo.findOne({
      where: { id },
      relations: { user: true, request: true },
    });
  }
  async create(data: any) { return this.invoiceRepo.save(data); }
  async update(id: string, data: any) { return this.invoiceRepo.save({ ...data, id }); }
  async remove(id: string) { await this.invoiceRepo.delete(id); return { deleted: true }; }
}
