import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) 
    private readonly userRepo: Repository<User>
  ) {}

  async findAll() { return this.userRepo.find(); }
  async findOne(id: string) { return this.userRepo.findOneBy({ id }); }
  async update(id: string, data: any) { return this.userRepo.save({ ...data, id }); }
  async remove(id: string) { await this.userRepo.delete(id); return { deleted: true }; }
}
