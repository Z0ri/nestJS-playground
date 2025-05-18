import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserInterface } from './interfaces/user.interface';
import { UserService } from './services/user/user.service';
import { ProductsService } from './services/products/products.service';
import { CategoryService } from './services/category/category.service';
import { FileReaderService } from './services/file-reader/file-reader.service';
import { CompanyService } from './services/company/company.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly companyService: CompanyService,
    private readonly categoryService: CategoryService,
    private readonly productsService: ProductsService,
    private readonly userService: UserService,
    private readonly fileReaderService: FileReaderService
  ) {}

  async onModuleInit(): Promise<void> {
    //INSERIMENTO DEGLI UTENTI DI DEFAULT PRESI DAL CSV
    const users = await this.fileReaderService.getUsersCsvData();
    if(users)
          await this.userService.putUsersInDB(users);
    // INSERIMENTO DELLE CATEGORIE 
    await this.categoryService.puDefaultCategories();
    //INSERIMENTO DEI PRODOTTI DI DEFAULT PRESI DALL'API ESTERNA
    await this.productsService.putDefaultProducts();
    //INSERIMENTO DELLE COMPAGNIE PRESENTI NEL FILE CSV
    const companies = await this.fileReaderService.getCompaniesCsvData();
    console.log(companies);
    if(companies)
      await this.companyService.putCompaniesInDB(companies);
  }
}
