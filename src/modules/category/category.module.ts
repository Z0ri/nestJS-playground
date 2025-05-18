import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/category.entity';
import { CategoryService } from 'src/services/category/category.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([CategoryEntity], 'readOnlyConnection'),
        TypeOrmModule.forFeature([CategoryEntity], 'writeOnlyConnection'),
    ],
    controllers: [],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}
