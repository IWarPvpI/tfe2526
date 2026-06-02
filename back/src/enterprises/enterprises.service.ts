import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enterprise } from './entities/enterprise.entity';

@Injectable()
export class EnterprisesService {
  constructor(
    @InjectRepository(Enterprise) 
    private readonly enterpriseRepo: Repository<Enterprise>
  ) {}

  async findAll() { return this.enterpriseRepo.find(); }
  async findOne(id: string) { return this.enterpriseRepo.findOneBy({ id }); }
  async create(data: any) { return this.enterpriseRepo.save(data); }
  async update(id: string, data: any) { return this.enterpriseRepo.save({ ...data, id }); }
}
