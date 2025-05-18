import { Body, Controller, Post } from '@nestjs/common';
import { CartService } from 'src/services/cart/cart.service';

@Controller('cart')
export class CartController {

    constructor(
        private cartService: CartService
    ){}

    @Post('item')
    async addItem(
    @Body() body: {
        cartId: number,
        productId: number
    }){
        const { productId, cartId } = body;
        return await this.cartService.addItem(productId, cartId);
    }
}
