import { Entity, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { CommonEntity } from './common.entity';
import { CartInterface } from 'src/interfaces/cart.interface';
import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';
import { CartItemsEntity } from './cartItems.entity';

@Entity('carts')
export class CartEntity extends CommonEntity implements CartInterface {
  productId: number;
  @Column({ nullable: false })
  userId: number;

  @OneToOne(() => UserEntity, user => user.cart)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => CartItemsEntity, item => item.cart)
  items: CartItemsEntity[];

  @OneToMany(() => OrderEntity, order => order.cart)
  orders: OrderEntity[];
}