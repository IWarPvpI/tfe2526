import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RequestStatus {
  INITIATED = 'INITIATED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column('jsonb')
  shippingDetails: {
    origine: any;
    destination: any;
    date: string;
    livraisonDate: string;
    poids: string;
  };

  @Column('jsonb')
  selectedOption: any;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.DRAFT,
  })
  status: RequestStatus;

  @Column({ nullable: true })
  fedexTrackingNumber?: string;

  @Column({ nullable: true })
  labelUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
