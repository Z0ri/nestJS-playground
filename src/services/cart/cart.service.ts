import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from 'src/entities/cart.entity';
import { CartItemsEntity } from 'src/entities/cartItems.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { UserEntity } from 'src/entities/user.entity';
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
     * Permette di ottenere tutti i prodotti all'interno di un carrello
     * @param cartId id del carrello
     * @returns array di cart entity trovate
     */
    async getCartItems(cartId: number){
        if(!cartId){
            throw new HttpException({
                message: "Nessun id di carrello fornito"
            }, HttpStatus.BAD_REQUEST)
        }

        try {
            const cart: CartEntity = await this.cartReadonlyRepository.findOne({
                where: {
                    id: cartId
                }
            });

            if(!cart){
                throw new HttpException({
                message: "L'id fornito non appartiene a nessun carrello esistente"
                }, HttpStatus.NOT_FOUND);
            }

            return this.cartItemsReadonlyRepository.find(
                { 
                    where: {
                        cartId: cartId
                    }
                }
            )
        } catch (error) {
            
        }
    }

    /**
     * Aggiunge un prodotto al carrello di un utente
     * @param productKey key del prodotto da aggiungere
     * @param userKey key dell'utente che vuole aggiungere il prodotto
     * @returns 
     */
    async addItemToUserCart(productKey: string, userKey: string): Promise<CartItemsEntity>{
        if (!productKey) {
            throw new HttpException(
                {
                    message: "Nessuna key di un prodotto fornita"
                }, 
                HttpStatus.BAD_REQUEST
            );
        }
        if (!userKey) {
            throw new HttpException(
                {
                    message: "Nessuna key di un utente fornita"
                }, 
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            const user = await this.userReadonlyRepository.findOne({
                where: { key: userKey }
            });

            if (!user) {
                throw new HttpException(
                    {
                        message: "Utente non trovato"
                    }, 
                    HttpStatus.NOT_FOUND
                );
            }

            const cart = await this.cartReadonlyRepository.findOne({
                where: {
                    userId: user.id
                },
            });

            if(!cart){
                throw new HttpException(
                    {
                        message: "Nessun carrello associato all'utente trovato"
                    }, 
                    HttpStatus.NOT_FOUND
                );
            }

            return await this.addItemToCart(productKey, cart.key);
        } catch (error) {
            if(error instanceof HttpException) throw error;

            throw new HttpException({
                message: "Errore nella ricerca del carrello dell'utente"
            },
            HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * Aggiunge un prodotto ad un carrello, se già presente, aumenta la quantità di quest'ultimo
     * @param productKey key del prodotto da aggiungere
     * @param cartKey key del carrello su cui aggiungere il prodotto
     * @returns item creato
     */
    async addItemToCart(productKey: string, cartKey: string) {
        if (!productKey) {
            throw new HttpException(
                {
                    message: "Nessuna key di un prodotto fornita"
                }, 
                HttpStatus.BAD_REQUEST
            );
        }

        if (!cartKey) {
            throw new HttpException(
                {
                    message: "Nessuna key del carrello fornita"
                }, 
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            //ricerca parallela
            const [product, cart] = await Promise.all([
                this.productReadonlyRepository.findOne({
                    where: { key: productKey }
                }),
                this.cartReadonlyRepository.findOne({
                    where: { key: cartKey }
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
                        message: "Carrello con la key specificata non trovato"
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
                    cartId: cart.id,
                    productId: product.id
                }
            });

            if (existingCartItem) {
                //controllo se aggiungendo +1 alla quantità del prodotto nel carrello supera la quantità del prodotto online
                if(existingCartItem.quantity + 1 > product.quantity){
                    throw new HttpException({
                        message: "Quantità disponibile insufficente"
                    },
                    HttpStatus.CONFLICT);
                }

                existingCartItem.quantity = (existingCartItem.quantity || 1) + 1; //incremento della quantità se l'item già esiste
                await this.cartItemsWriteonlyRepository.save(existingCartItem);
                return existingCartItem;
            }

            //creazione di un nuovo cart item
            const cartItem = this.cartItemsWriteonlyRepository.create({
                cartId: cart.id,
                productId: product.id,
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

    /**
     * Permette di ottenere i prodotti all'interno del carrello associato ad un utente
     * @param userKey key dell'utente con il carrello associato da cui prendere i prodotti
     * @returns array di prodotti all'interno del carrello
     */
    async getUserCartItems(userKey: string): Promise<CartItemsEntity[]>{
        if (!userKey) {
            throw new HttpException(
                {
                    message: "Nessuna use key passata"
                }, 
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            const user: UserEntity = await this.userReadonlyRepository.findOne({
                where: {
                    key: userKey
                },
                relations: {
                    cart: true
                }
            });

            return await this.getCartItems(user.cart.id);
        } catch (error) {
            if(error instanceof HttpException) throw error;
            throw new HttpException({
                message: "Errore durante la ricerca dei prodotti all'interno del carrello dell'utente",
                error: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
