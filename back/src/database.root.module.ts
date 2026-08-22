import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Request } from './requests/entities/request.entity';
import { RequestStatusHistory } from './requests/entities/request-status-history.entity';
import { Enterprise } from './enterprises/entities/enterprise.entity';
// import { Address } from './addresses/entities/address.entity';
// import { Contact } from './contacts/entities/contact.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { Payment } from './payments/entities/payment.entity';
import { AuditLog } from './audit-logs/entities/audit-log.entity';
import { Notification } from './notifications/entities/notification.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'uniship',
      entities: [User, Role, Request, RequestStatusHistory, Enterprise, Invoice, Payment, AuditLog, Notification],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Role, Request, RequestStatusHistory, Enterprise, Invoice, Payment, AuditLog, Notification]),
  ],
  providers: [SeedService],
  exports: [TypeOrmModule],
})
export class DatabaseRootModule {}
