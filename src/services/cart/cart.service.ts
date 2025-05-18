import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from 'src/entities/cart.entity';
import { CartItemsEntity } from 'src/entities/cartItems.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ProductInterface } from 'src/interfaces/product.interface';
import { Repository } from 'typeorm';

@Injectable()
export class CartService {
    constructor(
        //cart repository
        @InjectRepository(CartEntity, "readOnlyConnection")
        private readonly cartReadonlyRepository: Repository<CartEntity>,
        @InjectRepository(CartEntity, "writeOnlyConnection")
        private readonly cartWriteonlyRepository: Repository<CartEntity>,

        //cart item repository
        @InjectRepository(CartItemsEntity, "writeOnlyConnection")
        private readonly cartItemsWriteonlyRepository: Repository<CartItemsEntity>,
        @InjectRepository(CartItemsEntity, "readOnlyConnection")
        private readonly cartItemsReadonlyRepository: Repository<CartItemsEntity>,

        //product repository
        @InjectRepository(ProductEntity, "readOnlyConnection")
        private readonly productReadonlyRepository: Repository<ProductEntity>,

        //user repository
        @InjectRepository(UserEntity, "readOnlyConnection")
        private readonly userReadonlyRepository: Repository<UserEntity>,
    ){}

    /**
     * Imposta il carrello per gli utenti con gli id passati
     * @param userIds id degli utenti di cui creare il carrello
     */
    async addUsersCart(userIds: number[]){
        if(!userIds)
            throw new HttpException(
            {
                message: "Nessun id di utenti fornito"
            }, 
            HttpStatus.BAD_REQUEST);

        try {
            const users = await this.userReadonlyRepository.find({ select: ['id'] });
            const DBuserIds: number[] = users.map(user => user.id);


            userIds.forEach(async id => {
                if(DBuserIds.includes(id)){
                    const cart: CartEntity = this.cartWriteonlyRepository.create();
                    cart.userId = id;
                    await this.cartWriteonlyRepository.save(cart);
                }
            });
        } catch (error) {
            if(error instanceof HttpException) throw error;

            throw new HttpException({
                message: error.message || "Impossibile creare il carrello per gli/il utenti/e"
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Aggiunge un prodotto ad un carrello, se già presente, aumenta la quantità di quest'ultimo
     * @param productId id del prodotto da aggiungere
     * @param cartId id del carrello su cui aggiungere il prodotto
     * @returns item creato
     */
    async addItem(productId: number, cartId: number) {
        if (!productId) {
            throw new HttpException(
                {
                    message: "Nessun id di un prodotto fornito"
                }, 
                HttpStatus.BAD_REQUEST
            );
        }

        if (!cartId) {
            throw new HttpException(
                {
                    message: "Nessun id del carrello fornito"
                }, 
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            //ricerca parallela
            const [product, cart] = await Promise.all([
                this.productReadonlyRepository.findOne({
                    where: { id: productId }
                }),
                this.cartReadonlyRepository.findOne({
                    where: { id: cartId }
                })
            ]);

            if (!product) {
                throw new HttpException(
                    {
                        message: "Prodotto da acquistare inesistente"
                    }, 
                    HttpStatus.NOT_FOUND
                );
            }

            if (!cart) {
                throw new HttpException(
                    {
                        message: "Carrello con l'id specificato non trovato"
                    }, 
                    HttpStatus.NOT_FOUND
                );
            }

            if (product.quantity <= 0) {
                throw new HttpException(
                    {
                        message: "Il prodotto richiesto non è disponibile in magazzino"
                    }, 
                    HttpStatus.CONFLICT
                );
            }

            //controllo se l'item è già presente nel carrello
            const existingCartItem: CartItemsEntity = await this.cartItemsReadonlyRepository.findOne({
                where: {
                    cartId: cartId,
                    productId: productId
                }
            });

            if (existingCartItem) {
                existingCartItem.quantity = (existingCartItem.quantity || 1) + 1; //incremento della quantità se l'item già esiste
                await this.cartItemsWriteonlyRepository.save(existingCartItem);
                return existingCartItem;
            }

            //creazione di un nuovo cart item
            const cartItem = this.cartItemsWriteonlyRepository.create({
                cartId: cartId,
                productId: productId,
                quantity: 1 
            });

            return await this.cartItemsWriteonlyRepository.save(cartItem); //salvataggio del nuovo elemento nel DB
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                {
                    message: "Errore nel salvataggio del nuovo elemento nel carrello"
                }, 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
