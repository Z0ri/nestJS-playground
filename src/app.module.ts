import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { DownloadController } from './controllers/download/download.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProductsModule } from './modules/products/products.module';
import { join } from 'path';
import { CategoryModule } from './modules/category/category.module';
import { CompanyModule } from './modules/company/company.module';
import { FileReaderService } from './services/file-reader/file-reader.service';

@Module({
  imports: [
    // Carica il file .env e le variabili di ambiente in modo globale
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Connessione principale (mainConnection)
    TypeOrmModule.forRootAsync({
      name: 'mainConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_NAME'),
        entities: [join(__dirname, 'entities', '*.entity{.ts,.js}')],
        synchronize: true,
      }),
    }),

    // Connessione di sola scrittura (writeOnlyConnection)
    TypeOrmModule.forRootAsync({
      name: 'writeOnlyConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_NAME'),
        entities: [join(__dirname, 'entities', '*.entity{.ts,.js}')],
      }),
    }),

    // Connessione di sola lettura (readOnlyConnection)
    TypeOrmModule.forRootAsync({
      name: 'readOnlyConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_NAME'),
        entities: [join(__dirname, 'entities', '*.entity{.ts,.js}')],
      }),
    }),

    AuthModule,
    HttpModule,
    UserModule,
    ProductsModule,
    CategoryModule,
    CompanyModule,
  ],
  controllers: [AppController, DownloadController],
  providers: [AppService, FileReaderService],
})
export class AppModule {}