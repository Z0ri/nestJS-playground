import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { ProductInterface } from 'src/interfaces/product.interface';
import { CategoryEntity } from './category.entity';
import { UserEntity } from './user.entity';
import { PurchaseEntity } from './purchase.entity';
import { CartEntity } from './cart.entity';
import { OrderEntity } from './order.entity';
import { CompanyEntity } from './company.entity';
import { ReviewEntity } from './review.entity';

@Entity('products')
export class ProductEntity extends CommonEntity implements ProductInterface {
  constructor(partial: Partial<ProductEntity>) {
    super();
    Object.assign(this, partial);
  }
  
  @Column({ nullable: false })
  title: string;

  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: false, default: 0 })
  quantity: number;

  @Column()
  categoryId: number;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  companyId: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @OneToMany(() => PurchaseEntity, purchase => purchase.product)
  purchases: PurchaseEntity[];

  @OneToMany(() => ReviewEntity, review => review.product)
  reviews: ReviewEntity[];

  @OneToMany(() => CartEntity, cart => cart.product)
  carts: CartEntity[];

  @OneToMany(() => OrderEntity, order => order.product)
  orders: OrderEntity[];
}