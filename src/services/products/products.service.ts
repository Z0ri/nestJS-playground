import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInterface } from 'src/interfaces/product.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserEntity } from 'src/entities/user.entity';

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
  
      // Create product entities without the owner property
      const productEntities: ProductEntity[] = products.map((product) => {
        const productEntity = new ProductEntity(
          product.title,
          product.price,
          product.description,
          product.category,
          product.image,
        );
        // Important: initialize the owner property to null or it can be omitted
        // This is because the relationship is optional from the Product side
        return productEntity;
      });
  
      // Save the products to the database
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
        newProduct.title,
        newProduct.price,
        newProduct.description,
        newProduct.category,
        newProduct.image,
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

      const updateResult = await this.writeOnlyProductsRepository.update(
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

      const updatedProduct = await this.writeOnlyProductsRepository.findOne({
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
   * Effettua l'acquisto di un prodotto
   * @param buyerId id del compratore
   * @param productId id del prodotto comprato
   */
  async buyProduct(buyerId: number, productKey: string) {
    try {
      const buyer: UserEntity = await this.readOnlyUserRepository.findOne({
        where: { id: buyerId }
      });
  
      // verifica se esiste l'utente
      if (!buyer) {
        throw new HttpException("Nessun utente trovato con l'id specificato", HttpStatus.NOT_FOUND);
      }
  
      // Trova il prodotto
      const product: ProductEntity = await this.readOnlyProductsRepository.findOne({
        where: { key: productKey },
        relations: { owner: true }
      });
  
      // verifica se esiste il prodotto
      if (!product) {
        throw new HttpException("Nessun prodotto trovato con l'id specificato", HttpStatus.NOT_FOUND);
      }
  
      // Verifica se l'utente è il proprietario del prodotto
      if (product.owner && product.owner.id === buyer.id) {
        throw new HttpException("Prodotto già posseduto dall'utente", HttpStatus.CONFLICT);
      }

      //verifica se il prodotto è già stato comprato
      if(product.owner){
        throw new HttpException("Impossibile acquistare il prodotto: prodotto già acquistato da qualcun'altro", HttpStatus.CONFLICT);
      }
  
      // Verifica se l'utente ha abbastanza soldi
      if (buyer.money < product.price) {
        throw new HttpException("Impossibile acquistare il prodotto: saldo insufficiente", HttpStatus.BAD_REQUEST);
      }
      
      // sottrazione soldi dall'utente
      await this.writeOnlyUserRepository.update(
        { id: buyer.id },
        { money: buyer.money - product.price }
      );
      
      //associa il proprietario del prodotto all'utente
      await this.writeOnlyProductsRepository.update(
        { id: product.id },
        { owner: { id: buyer.id } }
      );
  
      return { 
        message: 'Prodotto acquistato con successo',
        product: product
      };
  
    } catch (error) {
    
      if (error instanceof HttpException) throw error;
    
      throw new HttpException(
        {
          message: "Errore imprevisto nell'acquisto del prodotto",
          error: error.message || error.toString(),
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
