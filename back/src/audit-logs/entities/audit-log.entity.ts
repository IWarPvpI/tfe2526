import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  action: string;

  @Column()
  entity: string;

  @Column()
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  beforeValue: any;

  @Column({ type: 'jsonb', nullable: true })
  afterValue: any;

  @Column()
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
