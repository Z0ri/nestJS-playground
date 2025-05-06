import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { UserInterface } from './interfaces/user.interface';
import { UserService } from './services/user/user.service';
import { ProductsService } from './services/products/products.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly productsService: ProductsService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit(): Promise<void> {
    //INSERIMENTO DEGLI UTENTI DI DEFAULT PRESI DAL CSV
    // const users = await this.getUsersCsvData();
    // await this.userService.putUsersInDB(users);
    //INSERIMENTO DEI PRODOTTI DI DEFAULT PRESI DALL'API ESTERNA
    // this.productsService.putDefaultProducts();
  }

  /**
   * Reads users from a CSV file and returns them as an array.
   */
  private async getUsersCsvData(): Promise<UserInterface[]> {
    const users: UserInterface[] = [];

    const filePath = path.join(process.cwd(), 'src/users.csv');

    return new Promise<UserInterface[]>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row: any) => {
          users.push(row as UserInterface);
        })
        .on('end', () => {
          resolve(users);
        })
        .on('error', (error) => {
          console.error('Errore durante la lettura del file CSV:', error);
          reject(error);
        });
    });
  }
}
