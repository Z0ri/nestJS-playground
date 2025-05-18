import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { UserInterface } from 'src/interfaces/user.interface';
import { CompanyInterface } from 'src/interfaces/company.interface';

@Injectable()
export class FileReaderService {


    /**
     * Legge gli utenti dal file CSV e li ritorna come un array
     */
    async getUsersCsvData(): Promise<UserInterface[]> {
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

    /**
     * Legge le compagnie dal file CSV e li ritorna come un array
     */
    async getCompaniesCsvData(): Promise<CompanyInterface[]> {
        const companies: CompanyInterface[] = [];
        
        const filePath = path.join(process.cwd(), 'src/companies.csv');

        return new Promise<CompanyInterface[]>((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv({ separator: ';' }))
                .on('data', (row: any) => {
                companies.push(row as CompanyInterface);
                })
                .on('end', () => {
                resolve(companies);
                })
                .on('error', (error) => {
                console.error('Errore durante la lettura del file CSV:', error);
                reject(error);
            });
        });
    }
}
