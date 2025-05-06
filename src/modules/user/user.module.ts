import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserService } from 'src/services/user/user.service';
import { UserController } from 'src/controllers/user/user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity], 'readOnlyConnection'), // Registra l'entità UserEntity nel DB tramite la "readOnlyConnection"
    TypeOrmModule.forFeature([UserEntity], 'writeOnlyConnection'), // Registra l'entità UserEntity nel DB tramite la "writeOnlyConnection"
    AuthModule, //Importato per usare i suoi export
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], //permette agli altri moduli che importano UserModule di usare UserService
})
export class UserModule {}
