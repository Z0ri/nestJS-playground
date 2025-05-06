import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import { CommonInterface } from 'src/interfaces/common.interface';
import { v4 as uuidv4 } from 'uuid';

// @Entity()
export class CommonEntity implements CommonInterface {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  key: string;

  @BeforeInsert()
  generateKey() {
    this.key = uuidv4();
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'int', default: 1 })
  version: number;
}
