import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog) 
    private readonly auditRepo: Repository<AuditLog>
  ) {}

  async findAll() { return this.auditRepo.find(); }
  async findOne(id: string) { return this.auditRepo.findOneBy({ id }); }
  async create(data: any) { return this.auditRepo.save(data); }
  async update(id: string, data: any) { return this.auditRepo.save({ ...data, id }); }
  async remove(id: string) { await this.auditRepo.delete(id); return { deleted: true }; }
}
