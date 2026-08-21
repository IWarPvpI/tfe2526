import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: { role: true, enterprise: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const hash = crypto.createHash('sha256').update(pass).digest('hex');

    if (user.passwordHash !== hash && user.passwordHash !== pass) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    return user;
  }

  async login(credentials: { email: string; password?: string }) {
    const user = await this.validateUser(credentials.email, credentials.password ? credentials.password : 'hash');
    const roleName = user.role?.name ? user.role.name : 'user';

    const payload = {
      sub: user.id,
      email: user.email,
      role: roleName,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: roleName,
      },
    };
  }

  async getMe(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: { role: true, enterprise: true },
    });
  }
}
