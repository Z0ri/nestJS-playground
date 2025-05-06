import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity, 'writeOnlyConnection')
    private writeOnlyUserRepository: Repository<UserEntity>,

    @InjectRepository(UserEntity, 'readOnlyConnection')
    private readOnlyUserRepository: Repository<UserEntity>,
  ) {}

  /**
   * Permette di effettuare il login di un utente
   * @param username username dell'account
   * @param password password dell'account
   * @returns token di accesso
   */
  async login(username: string, password: string): Promise<string> {
    //prendo utente con username passato
    const user = await this.readOnlyUserRepository.findOne({
      where: {
        username: username,
      },
    });

    if (!user) {
      throw new HttpException(
        'Accesso fallito, utente non trovato.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password); //compara la password criptata dell'utente con la password non cripata del body in modo equo

    if (!isPasswordCorrect) {
      throw new HttpException('Password errata', HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload: JwtPayload = {
        username: user.username,
        id: user.id,
        key: user.key,
        email: user.email,
        role: user.role,
      };
      const token = await this.jwtService.signAsync(payload);

      return token;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Errore nella generazione del token dell' utente",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Permette ad un utente di registrarsi
   * @param username username dell'utente da registrare
   * @param email email dell'utente da registrare
   * @param password password dell'utente da registrare
   * @returns Utente creato
   */
  async signUp(
    username: string,
    password: string,
    email: string,
  ): Promise<UserEntity> {
    const existingUser = await this.readOnlyUserRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new HttpException(
        'Utente già esistente con questo username',
        HttpStatus.CONFLICT,
      );
    }

    const userEntity = new UserEntity();
    userEntity.username = username;
    userEntity.email = email;
    userEntity.password = password;
    userEntity.role = 'Viewer';
    return await this.writeOnlyUserRepository.save(userEntity);
  }

  /**
   * Controlla se un token è valido e lancia i relativi errori in caso contrario
   * @param token token da validare
   */
  async validateToken(token: string): Promise<any> {
    try {
      // Verifies the token and decodes the payload
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('SECRET_TOKEN'),
      });
    } catch (error) {
      // Handle specific error cases
      if (error.name === 'TokenExpiredError') {
        throw new HttpException(
          'Il token è scaduto. Effettua di nuovo accesso.',
          HttpStatus.UNAUTHORIZED,
        );
      } else if (error.name === 'JsonWebTokenError') {
        throw new HttpException(
          'Il token è invalido. Potrebbe essere stato modificato.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // For any other errors that are not JWT-related
      throw new HttpException(
        'Errore di autenticazione: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
