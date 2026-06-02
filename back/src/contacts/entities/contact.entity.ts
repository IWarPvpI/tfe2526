import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,ManyToOne } from 'typeorm';
import { Enterprise } from '../../enterprises/entities/enterprise.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  roleInCompany: string;

  @ManyToOne(() => Enterprise)
  enterprise: Enterprise;

  @CreateDateColumn()
  createdAt: Date;
}
