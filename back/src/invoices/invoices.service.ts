import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) 
    private readonly invoiceRepo: Repository<Invoice>
  ) {}

  async findAll() { return this.invoiceRepo.find(); }
  async findOne(id: string) { return this.invoiceRepo.findOneBy({ id }); }
  async create(data: any) { return this.invoiceRepo.save(data); }
  async update(id: string, data: any) { return this.invoiceRepo.save({ ...data, id }); }
  async remove(id: string) { await this.invoiceRepo.delete(id); return { deleted: true }; }
}
