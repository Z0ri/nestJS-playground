import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInterface } from 'src/interfaces/product.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserEntity } from 'src/entities/user.entity';
import { CategoryEntity } from 'src/entities/category.entity';
import { CompanyEntity } from 'src/entities/company.entity';
import { CategoryEnum } from 'src/enum/Category.enum';

@Injectable()
export class ProductsService {
  restApi: string = 'products';

  constructor(
    @InjectRepository(ProductEntity, 'readOnlyConnection')
    private readonly readOnlyProductsRepository: Repository<ProductEntity>,
    @InjectRepository(ProductEntity, 'writeOnlyConnection')
    private readonly writeOnlyProductsRepository: Repository<ProductEntity>,
    
    @InjectRepository(UserEntity, 'readOnlyConnection')
    private readonly readOnlyUserRepository: Repository<UserEntity>,
    @InjectRepository(UserEntity, 'writeOnlyConnection')
    private readonly writeOnlyUserRepository: Repository<UserEntity>,

    @InjectRepository(CategoryEntity, 'readOnlyConnection')
    private readonly readonlyCategoryRepository: Repository<CategoryEntity>,

    private readonly httpService: HttpService,
  ) {}

  /**
   * Inserisce i prodotti di default presi dall'api free di fakestore
   * @returns promise di ProductEntity[]
   */
    async putDefaultProducts(): Promise<ProductEntity[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(
          'https://fakestoreapi.com/products',
        ),
      );

      const products: any[] = response.data;

      // Mappa per associare la categoria all'id della stessa nel database
      const categoryNameToId: Record<CategoryEnum, number> = {
        [CategoryEnum.MENS_CLOTHING]: 1,
        [CategoryEnum.WOMENS_CLOTHING]: 2,
        [CategoryEnum.JEWELERY]: 3,
        [CategoryEnum.ELECTRONICS]: 4,
      };

      const productEntities: ProductEntity[] = products.map(product => {
        const categoryId = categoryNameToId[product.category as CategoryEnum];

        if (!categoryId) {
          throw new Error(`Unknown category: ${product.category}`);
        }

        return new ProductEntity({
          title: product.title,
          price: product.price,
          description: product.description,
          image: product.image,
          quantity: 10, 
          categoryId: categoryId,
          key: product.key,
        });
      });

      return this.writeOnlyProductsRepository.save(productEntities);
    } catch (error) {
      console.error("Error inserting default products:", error);
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

  async createProduct(newProduct: ProductInterface): Promise<{ message: string, product: ProductEntity }> {
    try {
      const productEntity = new ProductEntity(
        {
          title: newProduct.title,
          price: newProduct.price,
          description: newProduct.description,
          company: new CompanyEntity({id: newProduct.companyId,}),
          key: newProduct.key,
        },
      );

      const savedProduct = await this.writeOnlyProductsRepository.save(productEntity);

      return {
        message: "Nuovo prodotto creato con successo",
        product: savedProduct,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: "Errore nella creazione del nuovo prodotto",
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
      const existingProduct = await this.writeOnlyProductsRepository.findOne({
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

      const existingCategory = await this.readonlyCategoryRepository.findOne({
        where:  {
          id: newProduct.categoryId
        }
      })

      if(!existingCategory){
        throw new HttpException({
          message: "Categoria inesistente"
        }, HttpStatus.NOT_FOUND);
      }

      const updateResult = await this.writeOnlyProductsRepository.update(
        { key },
        newProduct,
      );

      if (updateResult.affected === 0) {
        throw new HttpException(
          {
            message: 'Prodotto attuale e nuovo identici',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedProduct = await this.writeOnlyProductsRepository.findOne({
        where: { key },
      });

      return {
        message: 'Prodotto aggiornato con successo',
        updatedProduct: updatedProduct,
      };
    } catch (error) {
      if(error instanceof HttpException) throw error;
      
      throw new HttpException(
        {
          message: error.message || "Errore durante l'aggiornamento del prodotto",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Effettua l'acquisto di un prodotto
   * @param buyerId id del compratore
   * @param productId id del prodotto comprato
   */
  async buyProduct(buyerId: number, productKey: string) {
    //compra prodotto
  }
  
  

  /**
   * Elimina un prodotto
   * @param key chiave del prodotto da eliminare
   */
  async deleteProduct(key: string) {
    try {
      const result = await this.writeOnlyProductsRepository.delete({ key });

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
