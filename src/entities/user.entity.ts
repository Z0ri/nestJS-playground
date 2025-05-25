import { Entity, Column, ManyToOne, OneToMany, JoinColumn, BeforeInsert, OneToOne } from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserInterface } from 'src/interfaces/user.interface';
import { AddressEntity } from './address.entity';
import { PurchaseEntity } from './purchase.entity';
import { CartEntity } from './cart.entity';
import { ReviewEntity } from './review.entity';
import * as bcrypt from 'bcryptjs';


@Entity('users')
export class UserEntity extends CommonEntity implements UserInterface {
  constructor(partial?: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'float', default: 0 })
  money: number;

  @Column({ nullable: false })
  role: string;

  @Column({ nullable: true })
  addressId: number;

  @ManyToOne(() => AddressEntity)
  @JoinColumn({ name: 'addressId' })
  address: AddressEntity;

  @OneToMany(() => PurchaseEntity, purchase => purchase.user)
  purchases: PurchaseEntity[];

  @OneToMany(() => ReviewEntity, review => review.author)
  reviews: ReviewEntity[];

  @OneToOne(() => CartEntity, cart => cart.user)
  cart: CartEntity;

  @BeforeInsert()
  async criptPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
}