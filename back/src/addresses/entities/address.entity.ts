import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  label: string;

  @Column()
  contactFirstName: string;

  @Column()
  contactLastName: string;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column({ nullable: true })
  box: string;

  @Column()
  zipCode: string;

  @Column()
  city: string;

  @Column()
  countryCode: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
