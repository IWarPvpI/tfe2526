import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) 
    private readonly paymentRepo: Repository<Payment>
  ) {}

  async findAll() { return this.paymentRepo.find(); }
  async findOne(id: string) { return this.paymentRepo.findOneBy({ id }); }
  async create(data: any) { return this.paymentRepo.save(data); }
  async update(id: string, data: any) { return this.paymentRepo.save({ ...data, id }); }
  async remove(id: string) { await this.paymentRepo.delete(id); return { deleted: true }; }
}
