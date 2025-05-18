import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from 'src/entities/company.entity';
import { CompanyInterface } from 'src/interfaces/company.interface';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(CompanyEntity, "writeOnlyConnection")
        private readonly writeOnlyCompanyRepository: Repository<CompanyEntity>
    ){}

    async putCompaniesInDB(companies: CompanyInterface[]){
        if(!companies || companies.length <= 0)
        throw new HttpException(
        {
        message: "Nessuna compagnia da inserire fornita"
        },
        HttpStatus.BAD_REQUEST);

        try {
            const companyEntities: CompanyEntity[] = companies.map((company) => {
                if(company.name){
                    return new CompanyEntity(
                        {
                            name: company.name,
                            location: company.location,
                            founded_year: company.founded_year
                        }
                    );
                }
            });
        
            this.writeOnlyCompanyRepository.save(companyEntities);
        } catch (error) {
            if(error instanceof HttpException) throw error;

            throw new HttpException({
                message: "Errore nel salvataggio delle/a compagnie/a",
                error: error.message
            }, 
            HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
