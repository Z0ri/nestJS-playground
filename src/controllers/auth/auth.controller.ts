import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserEntity } from 'src/entities/user.entity';
import { AuthService } from 'src/services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Effettua il login di un utente
   */
  @Post('login')
  async login(
    @Res() response: Response,
    @Body()
    body: {
      username: string;
      password: string;
    },
  ) {
    try {
      const { username, password } = body;

      if (!username) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          messsage: 'Username non fornito.',
        });
      }

      if (!password) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          messsage: 'Password non fornita.',
        });
      }

      const access_token = await this.authService.login(username, password); //prende l'access token se il login va a buon fine

      response.cookie('authorization', {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000, // 24h
      });

      return response.status(HttpStatus.OK).json({
        success: true,
        access_token: access_token,
      });
    } catch (error) {
      response.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || "Errore nel login dell'utente",
      });
    }
  }

  /**
   * Effettua il signup di un utente
   */
  @Post('signup')
  async signUp(
    @Res() response: Response,
    @Body()
    body: {
      username: string;
      email: string;
      password: string;
    },
  ) {
    try {
      const { password, username, email } = body;

      if (!username && !password && !email) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: 'Paramtetri mancanti',
        });
      }

      if (!username) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: 'Username mancante',
        });
      }

      if (!email) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: 'Email mancante',
        });
      }

      if (!password) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: 'Password mancante',
        });
      }

      const newUser: UserEntity = await this.authService.signUp(
        username,
        password,
        email,
      );

      return response.status(HttpStatus.OK).json({
        message: 'Utente creato con successo!',
        user: newUser,
      });
    } catch (error) {
      response.status(error.status || 500).json({
        message: error.message || 'Errore nella registrazione',
      });
    }
  }
}
