import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from './common.entity';
import { ReviewInterface } from 'src/interfaces/review.interface';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';

@Entity('reviews')
export class ReviewEntity extends CommonEntity implements ReviewInterface {
  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  authorId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @Column({ nullable: false })
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}