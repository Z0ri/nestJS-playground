import { Entity, Column, OneToMany } from 'typeorm';
import { CommonEntity } from './common.entity';
import { CategoryInterface } from 'src/interfaces/category.interface';
import { ProductEntity } from './product.entity';
import { CategoryEnum } from 'src/enum/Category.enum';

@Entity('categories')
export class CategoryEntity extends CommonEntity implements CategoryInterface {
    
    constructor(partial: Partial<CategoryEntity>) {
        super();
        Object.assign(this, partial);
    }

    @Column({ nullable: false })
    name: CategoryEnum;

    @OneToMany(() => ProductEntity, product => product.category)
    products: ProductEntity[];
}