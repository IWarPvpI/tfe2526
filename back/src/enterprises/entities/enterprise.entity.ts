import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, default: 'SA' })
  type: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true, default: 'Belgique' })
  country: string;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ nullable: true })
  peppolId: string;

  @Column({ type: 'jsonb', nullable: true })
  contract: any;

  @Column({ type: 'jsonb', nullable: true })
  negotiatedRates: any;

  @CreateDateColumn()
  createdAt: Date;
}
