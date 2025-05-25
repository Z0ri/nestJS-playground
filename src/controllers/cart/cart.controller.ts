import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/enum/Roles';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { RequestWithUser } from 'src/interfaces/requestWithUser.interface';
import { CartService } from 'src/services/cart/cart.service';

@Controller('cart')
@UseGuards(AuthGuard, RolesGuard)
export class CartController {

    constructor(
        private cartService: CartService
    ){}

    @Get('item/user')
    @Roles(RoleEnum.Admin, RoleEnum.Editor, RoleEnum.Viewer)
    async getUserCartItems(
        @Req() request: Request & { user: RequestWithUser }, 
    ){
        return await this.cartService.getUserCartItems(request.user.key);
    }

    @Get('item')
    @Roles(RoleEnum.Admin, RoleEnum.Editor, RoleEnum.Viewer)
    async getCartItem(@Query('id') id: number){
        return await this.cartService.getCartItems(id);
    }

    @Post('item/user')
    @Roles(RoleEnum.Admin, RoleEnum.Editor, RoleEnum.Viewer)
    async addUserItem(
        @Query('key') productKey: string,
        @Req() request: Request & {user: RequestWithUser}
    ){
        return await this.cartService.addItemToUserCart(productKey, request.user.key);
    }

    @Post('item')
    @Roles(RoleEnum.Admin, RoleEnum.Editor, RoleEnum.Viewer)
    async addItem(
        @Query('productKey') productKey: string,
        @Query('cartKey') cartKey: string
    ){
        return await this.cartService.addItemToCart(productKey, cartKey);
    }
}
