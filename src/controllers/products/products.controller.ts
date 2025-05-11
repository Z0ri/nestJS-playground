import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Query,
  UseGuards,
  Delete,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { Role } from 'src/enum/Roles';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { ProductInterface } from 'src/interfaces/product.interface';
import { RequestWithUser } from 'src/interfaces/requestWithUser.interface';
import { ProductsService } from 'src/services/products/products.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  /**
   * Permette di ottenere tutti i prodotti o solo uno specifico se specificata la chiave nella query
   * @returns array di prodotti
   */
  @Roles(Role.Admin, Role.Editor, Role.Viewer)
  @Get()
  async getProducts(@Query('key') key: string) {
    if (key) {
      return await this.productsService.getProductBykey(key);
    } else {
      return await this.productsService.getAllProducts();
    }
  }

  /**
   * Permette di creare un prodotto e inserirlo nel database
   * @param newProduct nuovo prodotto nel body
   * @retuns nuovo prodotto creato
   */
  @Roles(Role.Admin)
  @Post()
  async createProduct(@Body() newProduct: ProductInterface) {
    try {
      return await this.productsService.createProduct(newProduct);
    } catch (error) {
      throw new HttpException(error.message || "Errore nella creazione del nuovo prodotto", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Permette di aggiornare un prodotto tramite la chiave
   * @param key chiave del prodotto da modificre
   * @param updatedProduct prodotto aggiornato nel body
   * @returns prodotto aggiornato
   */
  @Roles(Role.Admin, Role.Editor)
  @Patch()
  async updateProductByKey(
    @Query('key') key: string,
    @Body() updatedProduct: ProductInterface,
  ) {
    try{
      return await this.productsService.updateProductByKey(key, updatedProduct);
    }catch(error){
      throw new HttpException({
        message: "Errore nell'aggiornamento del prodotto",
        error: error.message
      },
      HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Elimina un prodotto tramite la chiave
   * @param key chiave del prodotto da eliminare
   * @returns messaggio di stato eliminazione
   */
  @Roles(Role.Admin, Role.Editor)
  @Delete()
  async deleteProductByKey(@Query('key') key: string) {
    try {
      return await this.productsService.deleteProduct(key);
    } catch (error) {
      throw new HttpException({
        message: "Errore nell'eliminazione del prodotto",
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Permette ad un utente di comprare un prodotto, quindi diventare il suo "owner"
   * @param request richiesta
   * @param productKey chiave del prodotto da comprare
   * @returns messaggio di stato acquisto e prodotto acquistato
   */
  @Roles(Role.Admin, Role.Editor, Role.Viewer)
  @Post('/buy')
  async buyProduct(@Req() request: Request & {user: RequestWithUser}, @Query('key') productKey: string) {
    const buyerId = request.user.id;
  
    try {
      return await this.productsService.buyProduct(buyerId, productKey);
    } catch (error) {
  
      if (error instanceof HttpException) {
        throw error; 
      }
  
      throw new HttpException(
        {
          message: "Errore imprevisto nell'acquisto del prodotto",
          error: error.message || error.toString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
}
