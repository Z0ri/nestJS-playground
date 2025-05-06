import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { DownloadController } from './controllers/download/download.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductsController } from './controllers/products/products.controller';
import { ProductsService } from './services/products/products.service';
import { HttpModule } from '@nestjs/axios';
import { ProductsModule } from './modules/products/products.module';

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
        entities: [UserEntity, ProductEntity],
        synchronize: false,
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
        entities: [UserEntity, ProductEntity],
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
        entities: [UserEntity, ProductEntity],
      }),
    }),

    UserModule,
    AuthModule,
    ProductsModule,
    HttpModule,
  ],
  controllers: [AppController, DownloadController],
  providers: [AppService],
})
export class AppModule {}
