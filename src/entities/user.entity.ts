import { CommonInterface } from 'src/interfaces/common.interface';
import { CommonEntity } from './common.entity';
import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserInterface } from 'src/interfaces/user.interface';
import { ProductEntity } from './product.entity';
import { Role } from 'src/enum/Roles';

@Entity('users')
export class UserEntity extends CommonEntity implements UserInterface {
  constructor(
    username?: string,
    email?: string,
    password?: string,
    money: number = 0,
    role: string = Role.Viewer,
  ) {
    super();
    this.username = username;
    this.email = email;
    this.password = password;
    this.money = money;
    this.role = role;
  }

  @OneToMany(() => ProductEntity, (product) => product.owner)
  products: ProductEntity[];

  @Column({ nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'float', default: 0 })
  money: number;  

  @Column({ type: 'varchar', nullable: false })
  role: string;

  @BeforeInsert()
  async criptPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
}