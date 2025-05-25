import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from 'src/controllers/cart/cart.controller';
import { CartEntity } from 'src/entities/cart.entity';
import { CartItemsEntity } from 'src/entities/cartItems.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CartService } from 'src/services/cart/cart.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CartEntity], "writeOnlyConnection"),
        TypeOrmModule.forFeature([CartEntity], "readOnlyConnection"),
        
        TypeOrmModule.forFeature([ProductEntity], "readOnlyConnection"),

        TypeOrmModule.forFeature([UserEntity], "readOnlyConnection"),

        TypeOrmModule.forFeature([CartItemsEntity], "readOnlyConnection"),
        TypeOrmModule.forFeature([CartItemsEntity], "writeOnlyConnection"),
        AuthModule
    ],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService]
})
export class CartModule {}
