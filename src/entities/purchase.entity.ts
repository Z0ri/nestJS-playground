import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { PurchaseInterface } from 'src/interfaces/purchase.interface';
import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';

@Entity('purchases')
export class PurchaseEntity extends CommonEntity implements PurchaseInterface {
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

  @Column({ type: 'double precision' })
  moneyAmount: number;
}