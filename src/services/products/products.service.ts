import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInterface } from 'src/interfaces/product.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductsService {
  restApi: string = 'products';

  constructor(
    @InjectRepository(ProductEntity, 'readOnlyConnection')
    private readonly readOnlyProductsRepository: Repository<ProductEntity>,
    @InjectRepository(ProductEntity, 'writeOnlyConnection')
    private readonly writeOnlyRepository: Repository<ProductEntity>,

    private readonly httpService: HttpService,
  ) {}

  /**
   * Inserisce i prodotti di default presi dall'api free di fakestore
   * @returns promise di ProductEntity[]
   */
  async putDefaultProducts(): Promise<ProductEntity[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ProductInterface[]>(
          'https://fakestoreapi.com/products',
        ),
      );

      const products: ProductInterface[] = response.data;

      const productEntities: ProductEntity[] = products.map((product) => {
        return new ProductEntity(
          product.title,
          product.price,
          product.description,
          product.category,
          product.image,
        );
      });
      return this.writeOnlyRepository.save(productEntities);
    } catch (error) {
      throw new HttpException(
        "Errore nell'inserimento dei prodotti di default",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Permette di ottenere tutti i prodotti salvati nel database
   * @returns promise di array di prodotti
   */
  async getAllProducts(): Promise<ProductEntity[]> {
    try {
      return await this.readOnlyProductsRepository.find();
    } catch (error) {
      throw new HttpException(
        {
          message: 'Errore nella ricerca di tutti i prodotti',
          error: error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Prende un prodotto tramite la sua chiave
   * @param key chiave del prodotto da prendere
   * @returns promise della product entity trovata
   */
  async getProductBykey(key: string): Promise<ProductEntity> {
    try {
      if (!key) {
        throw new HttpException(
          {
            message: 'Nessuna chiave fornita per il recupero del prodotto',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const foundProduct = await this.readOnlyProductsRepository.findOne({
        where: {
          key: key,
        },
      });

      if (!foundProduct) {
        throw new HttpException(
          {
            message: 'Nessun prodotto trovato con la chiave specificata',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return foundProduct;
    } catch (error) {
      throw new HttpException(
        {
          message: "Errore nell'ottenimento del prodotto tramite la sua chiave",
          error: error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Permette di creare un nuovo prodotto e inserirlo nel database
   * @returns promise della nuova product entity creata
   */
  async createProduct(newProduct: ProductInterface): Promise<ProductEntity> {
    try {
      const productEntity = new ProductEntity(
        newProduct.title,
        newProduct.price,
        newProduct.description,
        newProduct.category,
        newProduct.image,
      );
      return await this.writeOnlyRepository.save(productEntity);
    } catch (error) {
      throw new HttpException(
        {
          message: "Errore nell'aggiunta del nuovo prodotto",
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Aggiorna un prodotto nel database
   * @param key chiave del prodotto da modificare
   * @param newProduct nuovi dati con cui modificare il prodotto
   * @returns
   */
  async updateProductByKey(
    key: string,
    newProduct: ProductInterface,
  ): Promise<{ message: string; updatedProduct: ProductInterface }> {
    try {
      const existingProduct = await this.writeOnlyRepository.findOne({
        where: { key },
      });

      if (!existingProduct) {
        throw new HttpException(
          {
            message: 'Prodotto con la chiave specificata non trovato',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const updateResult = await this.writeOnlyRepository.update(
        { key },
        newProduct,
      );

      if (updateResult.affected === 0) {
        throw new HttpException(
          {
            message: 'Nessuna modifica apportata al prodotto',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedProduct = await this.writeOnlyRepository.findOne({
        where: { key },
      });

      return {
        message: 'Prodotto aggiornato con successo',
        updatedProduct,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: "Errore durante l'aggiornamento del prodotto",
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Elimina un prodotto
   * @param key chiave del prodotto da eliminare
   */
  async deleteProduct(key: string) {
    try {
      const result = await this.writeOnlyRepository.delete({ key });

      if (result.affected === 0) {
        throw new HttpException(
          {
            message: 'Prodotto non trovato',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Prodotto eliminato con successo',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: "Errore nell'eliminazione del prodotto",
          error: error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
