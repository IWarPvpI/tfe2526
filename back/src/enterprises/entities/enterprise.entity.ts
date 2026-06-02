import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

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
