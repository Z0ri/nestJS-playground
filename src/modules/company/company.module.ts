import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from 'src/entities/company.entity';
import { CompanyService } from 'src/services/company/company.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([CompanyEntity], "writeOnlyConnection")
    ],
    controllers: [],
    providers: [
        CompanyService
    ],
    exports: [
        CompanyService
    ],
})
export class CompanyModule {}
