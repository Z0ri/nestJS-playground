import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { OrderInterface } from 'src/interfaces/order.interface';
import { ProductEntity } from './product.entity';
import { AddressEntity } from './address.entity';
import { OrderStatusEntity } from './orderStatus.entity';
import { CartEntity } from './cart.entity';
import { CompanyEntity } from './company.entity';

@Entity('orders')
export class OrderEntity extends CommonEntity implements OrderInterface {
  @Column()
  companyId: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Column()
  cartId: number;

  @ManyToOne(() => CartEntity)
  @JoinColumn({ name: 'cartId' })
  cart: CartEntity;

  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  delivery_addressId: number;

  @ManyToOne(() => AddressEntity)
  @JoinColumn({ name: 'delivery_addressId' })
  delivery_address: AddressEntity;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ default: 1 })
  statusId: number;

  @ManyToOne(() => OrderStatusEntity)
  @JoinColumn({ name: 'statusId' })
  status: OrderStatusEntity;
}