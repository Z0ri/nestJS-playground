import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/controllers/auth/auth.controller';
import { UserEntity } from 'src/entities/user.entity';
import { AuthService } from 'src/services/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([UserEntity], 'readOnlyConnection'), // Registra l'entità UserEntity nel DB tramite la "readOnlyConnection"
    TypeOrmModule.forFeature([UserEntity], 'writeOnlyConnection'), // Registra l'entità UserEntity nel DB tramite la "writeOnlyConnection"
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule], //permette agli altri moduli che importano UserModule di usare AuthService e JwtModule
})
export class AuthModule {}
