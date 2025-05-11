import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  Res,
  UseGuards,
  HttpStatus,
  Query,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { UserInterface } from 'src/interfaces/user.interface';
import { Role } from 'src/enum/Roles';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { UserService } from 'src/services/user/user.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles(Role.Admin, Role.Editor, Role.Viewer)
  async getUsers(@Query('key') userKey: string) {
    if (userKey) {
      return this.getUserByKey(userKey);
    }
    return this.userService.getUsers();
  }

  private async getUserByKey(userKey: string) {
    return this.userService.getUserByKey(userKey);
  }

  @Roles(Role.Admin)
  @Post()
  async createUser(@Res() response: Response, @Body() newUser: UserInterface) {
    try {
      await this.userService.putUsersInDB([newUser]);

      return response.status(HttpStatus.OK).json({
        message: 'Nuovo utente creato con successo!',
        user: newUser,
      });
    } catch (error) {
      return response.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Errore nella creazione dell'utente",
        error: error.message,
      });
    }
  }

  @Roles(Role.Admin, Role.Editor)
  @Patch()
  async updateUserByKey(
    @Query('key') userKey: string,  
    @Body() body: { username?: string; email?: string },
  ) {
    const { username, email } = body;

    if (!userKey) {
      throw new HttpException(
        {
          message: "La 'key' dell'utente è obbligatoria",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const updatedUser = await this.userService.updateUserByKey(userKey, username, email);
      return {
        message: 'Utente modificato con successo',
        updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: `Errore nell'aggiornamento dell'utente con key ${userKey}`,
          error: error.message,  
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles(Role.Admin, Role.Editor)
  @Delete()
  async deleteUserByKey(@Query('key') userKey: string, @Res() response: Response) {
    try {
      await this.userService.deleteUserByKey(userKey);
      return response.status(HttpStatus.OK).json({
        message: `Utente con id ${userKey} eliminato con successo`,
      });
    } catch (error) {
      return response.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Errore nella cancellazione dell'utente con id ${userKey}`,
        error: error.message,
      });
    }
  }
}
