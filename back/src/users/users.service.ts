import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import {Role} from "../roles/entities/role.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) 
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async create(data: any) {
    const passwordHash = crypto
      .createHash('sha256')
      .update(data.passwordHash)
      .digest('hex');

    const defaultRole = await this.roleRepo.findOneBy({ name: 'user' });

    return this.userRepo.save({
      ...data,
      isActive: true,
      passwordHash: passwordHash,
      role: defaultRole,
    });
  }
  async findAll() { return this.userRepo.find(); }
  async findOne(id: string) { return this.userRepo.findOneBy({ id }); }
  async update(id: string, data: any) { return this.userRepo.save({ ...data, id }); }
  async remove(id: string) { await this.userRepo.delete(id); return { deleted: true }; }
}
