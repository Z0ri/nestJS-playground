import { CommonInterface } from 'src/interfaces/common.interface';
import { CommonEntity } from './common.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserInterface } from 'src/interfaces/user.interface';

@Entity('users')
export class UserEntity extends CommonEntity implements UserInterface {
  constructor(
    username?: string,
    email?: string,
    password?: string,
    role: string = 'user',
  ) {
    super();
    if (username && email && password) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.role = role;
    }
  }

  @Column({ nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: false })
  role: string;

  @BeforeInsert()
  async criptPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
}
