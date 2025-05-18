import { Entity, Column, OneToMany } from 'typeorm';
import { CommonEntity } from './common.entity';
import { CompanyInterface } from 'src/interfaces/company.interface';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';

@Entity('companies')
export class CompanyEntity extends CommonEntity implements CompanyInterface {

    constructor(partial: Partial<CompanyEntity>) {
        super();
        Object.assign(this, partial);
    }
    
    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    location: string;

    @Column({ type: 'date', nullable: true })
    founded_year: Date;

    @OneToMany(() => ProductEntity, product => product.company)
    products: ProductEntity[];

    @OneToMany(() => OrderEntity, order => order.company)
    orders: OrderEntity[];
}