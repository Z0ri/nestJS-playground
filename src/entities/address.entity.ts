import { Entity, Column, OneToMany } from 'typeorm';
import { CommonEntity } from './common.entity';
import { AddressInterface } from 'src/interfaces/address.interface';
import { UserEntity } from './user.entity';
import { OrderEntity } from './order.entity';

@Entity('addresses')
export class AddressEntity extends CommonEntity implements AddressInterface {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  civic_number: number;

  @OneToMany(() => UserEntity, user => user.address)
  users: UserEntity[];

  @OneToMany(() => OrderEntity, order => order.delivery_address)
  orders: OrderEntity[];
}

