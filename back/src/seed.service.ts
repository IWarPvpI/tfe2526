import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Request, RequestStatus } from './requests/entities/request.entity';
import { RequestStatusHistory } from './requests/entities/request-status-history.entity';
import { Enterprise } from './enterprises/entities/enterprise.entity';
import { Address } from './addresses/entities/address.entity';
import { Contact } from './contacts/entities/contact.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { Payment } from './payments/entities/payment.entity';
import { AuditLog } from './audit-logs/entities/audit-log.entity';
import { Notification } from './notifications/entities/notification.entity';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Enterprise) private enterpriseRepo: Repository<Enterprise>,
        @InjectRepository(Address) private addressRepo: Repository<Address>,
        @InjectRepository(Contact) private contactRepo: Repository<Contact>,
        @InjectRepository(Request) private requestRepo: Repository<Request>,
        @InjectRepository(RequestStatusHistory) private historyRepo: Repository<RequestStatusHistory>,
        @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
        @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
        @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
        @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    ) {}

    async onModuleInit() {
        await this.seed();
    }

    async seed() {
        this.logger.log('🌱 Starting full DBZ database seeding...');
        
        try {
            // 1. Roles
            const adminRole = await this.roleRepo.save({ name: 'admin' });
            const userRole = await this.roleRepo.save({ name: 'user' });

            // 2. Enterprises
            const capsuleCorp = await this.enterpriseRepo.save({ 
                name: 'Capsule Corp', 
                vatNumber: 'BE0123456789', 
                peppolId: '0123456789012',
                contract: { discount: '10%', priority: 'High' },
                negotiatedRates: { international: 'fixed' }
            });
            const redRibbon = await this.enterpriseRepo.save({ 
                name: 'Red Ribbon Army', 
                vatNumber: 'BE9876543210',
                contract: { discount: '2%', priority: 'Low' }
            });

            // 3. Users
            const goku = await this.userRepo.save({ 
                email: 'goku@saiyan.com', passwordHash: 'hash', firstName: 'Goku', lastName: 'Kakarot', phone: '123', role: adminRole, enterprise: capsuleCorp 
            });
            const vegeta = await this.userRepo.save({ 
                email: 'vegeta@saiyan.com', passwordHash: 'hash', firstName: 'Vegeta', lastName: 'Prince', phone: '456', role: adminRole, enterprise: capsuleCorp 
            });
            const krillin = await this.userRepo.save({ 
                email: 'krillin@earth.com', passwordHash: 'hash', firstName: 'Krillin', lastName: 'Earth', phone: '789', role: userRole, enterprise: capsuleCorp 
            });
            const freezer = await this.userRepo.save({ 
                email: 'freezer@space.com', passwordHash: 'hash', firstName: 'Freezer', lastName: 'Emperor', phone: '000', role: userRole, enterprise: redRibbon 
            });

            // 4. Addresses
            const addr1 = await this.addressRepo.save({ 
                label: 'Sede Capsule Corp', contactFirstName: 'Bulma', contactLastName: 'Brief', street: 'West City Ave', number: '1', zipCode: '1000', city: 'Bruxelles', countryCode: 'BE', user: goku 
            });
            const addr2 = await this.addressRepo.save({ 
                label: 'Montagne Korin', contactFirstName: 'Korin', contactLastName: 'Cat', street: 'Sky Mt', number: '1', zipCode: '3000', city: 'Bruxelles', countryCode: 'BE', user: krillin 
            });

            // 5. Contacts
            await this.contactRepo.save({ 
                firstName: 'Bulma', lastName: 'Brief', email: 'bulma@capsule.com', phone: '111', roleInCompany: 'CEO', enterprise: capsuleCorp 
            });
            await this.contactRepo.save({ 
                firstName: 'Commander', lastName: 'Red', email: 'red@ribbon.com', phone: '222', roleInCompany: 'General', enterprise: redRibbon 
            });

            // 6. Requests
            const req = await this.requestRepo.save({ 
                user: krillin, 
                createdBy: goku, 
                status: RequestStatus.CONFIRMED,
                shippingDetails: { 
                    origine: { street: 'Street A', city: 'Brussels', country: 'BE' }, 
                    destination: { street: 'Street B', city: 'Tokyo', country: 'JP' }, 
                    date: '2026-06-10', livraisonDate: '2026-06-15', poids: '5.0' 
                },
                selectedOption: { service: 'FedEx Priority', cost: 50.0 }
            });

            // 7. Request Status History (The missing part)
            await this.historyRepo.save([
                { request: req, status: 'DRAFT', note: 'Created by user' },
                { request: req, status: 'CONFIRMED', note: 'Confirmed by Goku' }
            ]);

            // 8. Invoices
            const inv = await this.invoiceRepo.save({ 
                request: req, 
                user: krillin, 
                invoiceNumber: 'INV-2026-001', 
                type: 'facture', 
                amountExclVat: 40.0, 
                vatRate: 21, 
                amountInclVat: 48.4, 
                currency: 'EUR', 
                paymentStatus: 'UNPAID' 
            });

            // 9. Payments
            await this.paymentRepo.save({ 
                invoice: inv, 
                provider: 'STRIPE', 
                providerPaymentId: 'ch_123456789', 
                amount: 48.4, 
                status: 'COMPLETED' 
            });

            // 10. Audit Logs
            await this.auditRepo.save({ 
                user: goku, 
                action: 'CREATE_REQUEST', 
                entity: 'Request', 
                entityId: req.id, 
                ipAddress: '127.0.0.1' 
            });

            // 11. Notifications
            await this.notificationRepo.save({ 
                user: krillin, 
                channel: 'email', 
                subject: 'Demande Confirmée', 
                body: 'Votre demande de transport a été confirmée.', 
                isRead: false 
            });

            this.logger.log('✅ DBZ Full Seeding completed successfully!');
        } catch (error) {
            this.logger.error(`❌ Seeding failed: ${error.message}`);
        }
    }
}
