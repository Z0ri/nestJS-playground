// src/entities/order-status.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { CommonEntity } from './common.entity';
import { OrderEntity } from './order.entity';
import { OrderStatusInterface } from 'src/interfaces/orderStatus.interface';

@Entity('order_statuses')
export class OrderStatusEntity extends CommonEntity implements OrderStatusInterface {
  @Column({ nullable: false })
  name: string;

  @OneToMany(() => OrderEntity, order => order.status)
  orders: OrderEntity[];
}