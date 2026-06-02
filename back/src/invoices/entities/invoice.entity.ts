import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Request } from '../../requests/entities/request.entity';
import { User } from '../../users/entities/user.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Request)
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  invoiceNumber: string;

  @Column()
  type: string; // facture, avoir

  @Column('float')
  amountExclVat: number;

  @Column('float')
  vatRate: number;

  @Column('float')
  amountInclVat: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @Column({ nullable: true })
  peppolDocumentId: string;

  @Column()
  paymentStatus: string;

  @CreateDateColumn()
  issuedAt: Date;

  @Column({ nullable: true })
  paidAt: Date;
}
