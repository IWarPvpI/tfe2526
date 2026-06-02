import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) 
    private readonly contactRepo: Repository<Contact>
  ) {}

  async findAll() { return this.contactRepo.find(); }
  async findOne(id: string) { return this.contactRepo.findOneBy({ id }); }
  async create(data: any) { return this.contactRepo.save(data); }
  async update(id: string, data: any) { return this.contactRepo.save({ ...data, id }); }
  async remove(id: string) { await this.contactRepo.delete(id); return { deleted: true }; }
}
