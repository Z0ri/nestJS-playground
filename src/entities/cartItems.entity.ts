import { cartItemsInterface } from "src/interfaces/cartItemsInterface";
import { CommonEntity } from "./common.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CartEntity } from "./cart.entity";
import { ProductEntity } from "./product.entity";

@Entity('cartItems')
export class CartItemsEntity extends CommonEntity implements cartItemsInterface {
  @Column()
  productId: number;

  @Column()
  cartId: number;

  @ManyToOne(() => CartEntity, cart => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: CartEntity;

  @ManyToOne(() => ProductEntity, product => product.cartItems)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ type: "integer", nullable: false })
  quantity: number;
}
