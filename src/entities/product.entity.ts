import { ProductInterface } from 'src/interfaces/product.interface';
import { CommonEntity } from './common.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('products')
export class ProductEntity extends CommonEntity implements ProductInterface {
  constructor(
    title?: string,
    price?: number,
    description?: string,
    category?: string,
    image?: string,
  ) {
    super();
    this.title = title;
    this.price = price;
    this.description = description;
    this.category = category;
    this.image = image;
  }

  @ManyToOne(() => UserEntity, (user) => user.products, { nullable: true })
  owner: UserEntity | null;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ nullable: false })
  price: number;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  category: string;

  @Column({ type: 'varchar' })
  image: string;
}