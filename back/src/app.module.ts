import { Module } from '@nestjs/common';
import { DatabaseRootModule } from './database.root.module';
import { RequestsModule } from './requests/requests.module';
import { UsersModule } from './users/users.module';
import { EnterprisesModule } from './enterprises/enterprises.module';
import { AddressesModule } from './addresses/addresses.module';
import { ContactsModule } from './contacts/contacts.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DatabaseRootModule, 
    AuthModule,
    RequestsModule, 
    UsersModule, 
    EnterprisesModule, 
    AddressesModule, 
    ContactsModule, 
    InvoicesModule, 
    PaymentsModule, 
    AuditLogsModule, 
    NotificationsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
