import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CommonEntity } from './common.entity';
import { CartInterface } from 'src/interfaces/cart.interface';
import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';

@Entity('carts')
export class CartEntity extends CommonEntity implements CartInterface {
  @Column()
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @OneToMany(() => OrderEntity, order => order.cart)
  orders: OrderEntity[];
}