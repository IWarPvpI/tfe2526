import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address) 
    private readonly addressRepo: Repository<Address>
  ) {}

  async findAll() { return this.addressRepo.find(); }
  async findOne(id: string) { return this.addressRepo.findOneBy({ id }); }
  async create(data: any) { return this.addressRepo.save(data); }
  async update(id: string, data: any) { return this.addressRepo.save({ ...data, id }); }
  async remove(id: string) { await this.addressRepo.delete(id); return { deleted: true }; }
}
