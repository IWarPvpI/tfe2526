import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Request } from '../../requests/entities/request.entity';

@Entity('request_status_history')
export class RequestStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Request)
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @Column()
  status: string;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  changedAt: Date;
}
