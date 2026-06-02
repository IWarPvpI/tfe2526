import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) 
    private readonly notificationRepo: Repository<Notification>
  ) {}

  async findAll() { return this.notificationRepo.find(); }
  async findOne(id: string) { return this.notificationRepo.findOneBy({ id }); }
  async create(data: any) { return this.notificationRepo.save(data); }
  async update(id: string, data: any) { return this.notificationRepo.save({ ...data, id }); }
  async remove(id: string) { await this.notificationRepo.delete(id); return { deleted: true }; }
}
