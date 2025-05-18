import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/category.entity';
import { CategoryEnum } from 'src/enum/Category.enum';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {

    constructor(
        @InjectRepository(CategoryEntity, 'readOnlyConnection')
        private readonly readonlyCategoryRepository: Repository<CategoryEntity>,
        @InjectRepository(CategoryEntity, 'writeOnlyConnection')
        private readonly writeonlyCategoryRepository: Repository<CategoryEntity>
    ){}
    async puDefaultCategories(){
        try {
            const categoryEntities: CategoryEntity[] = Object.values(CategoryEnum).map(category => {
                return new CategoryEntity({name: category});
            });

            await this.writeonlyCategoryRepository.save(categoryEntities);
        } catch (error) {
            if(error instanceof HttpException) throw error;

            throw new HttpException({
                message: "Errore nell'inserimento delle categorie nel database",
                error: error
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
