import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from 'src/controllers/products/products.controller';
import { ProductEntity } from 'src/entities/product.entity';
import { ProductsService } from 'src/services/products/products.service';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from 'src/entities/user.entity';
import { CategoryEntity } from 'src/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity], 'readOnlyConnection'), // Registra l'entità ProductEntity nel DB tramite la "readOnlyConnection"
    TypeOrmModule.forFeature([ProductEntity], 'writeOnlyConnection'), // Registra l'entità ProductEntity nel DB tramite la "writeOnlyConnection"
    TypeOrmModule.forFeature([UserEntity], 'readOnlyConnection'), // Registra l'entità UserEntity nel DB tramite la "readOnlyConnection"
    TypeOrmModule.forFeature([UserEntity], 'writeOnlyConnection'), // Registra l'entità UserEntity nel DB tramite la "writeOnlyConnection"
    TypeOrmModule.forFeature([CategoryEntity], 'readOnlyConnection'), 
    HttpModule,
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
