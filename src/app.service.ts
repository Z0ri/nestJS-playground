import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { ProductsService } from './services/products/products.service';
import { CategoryService } from './services/category/category.service';
import { FileReaderService } from './services/file-reader/file-reader.service';
import { CompanyService } from './services/company/company.service';
import { CartService } from './services/cart/cart.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly companyService: CompanyService,
    private readonly categoryService: CategoryService,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly userService: UserService,
    private readonly fileReaderService: FileReaderService
  ) {}

  async onModuleInit(): Promise<void> {
    
    const users = await this.fileReaderService.getUsersCsvData();
    if(users){
      const userEntities: UserEntity[] = await this.userService.putUsersInDB(users); //INSERIMENTO DEGLI UTENTI DI DEFAULT PRESI DAL CSV
      
       await this.cartService.addUsersCart(userEntities.map(user => user.id)); //INSERIMENTO DEI CARRELLI ASSOCIATI AGLI UTENTI
     }
    
     await this.categoryService.puDefaultCategories(); //INSERIMENTO DELLE CATEGORIE 
    
     await this.productsService.putDefaultProducts(); //INSERIMENTO DEI PRODOTTI DI DEFAULT PRESI DALL'API ESTERNA
    
     const companies = await this.fileReaderService.getCompaniesCsvData(); 
     if(companies)
       await this.companyService.putCompaniesInDB(companies); //INSERIMENTO DELLE COMPAGNIE PRESENTI NEL FILE CSV
  }
}
