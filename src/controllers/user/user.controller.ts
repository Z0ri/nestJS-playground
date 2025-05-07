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
  UsePipes,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { Role } from 'src/enum/Roles';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { UserInterface } from 'src/interfaces/user.interface';
import { UserService } from 'src/services/user/user.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles(Role.Admin, Role.Editor, Role.Viewer)
  async getUsers() {
    return await this.userService.getUsers();
  }

  @Roles(Role.Admin)
  @Post('admin')
  async createUser(@Res() response: Response, @Body() newUser: UserInterface) {
    try {
      await this.userService.putUsersInDB([newUser]);

      return response.status(HttpStatus.OK).json({
        message: 'Nuovo utente creato con successo!',
        user: newUser,
      });
    } catch (error) {
      response.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Errore nella creazione dell'utente",
        error: error.message,
      });
    }
  }

  @Roles(Role.Admin, Role.Viewer, Role.Editor)
  @UsePipes(ParseIntPipe)
  @Get(':id')
  async getUserById(
    // @Req() req: Request & { user: UserInterface }, permette di ottenere l'utente impostato nell'authGuard dentro il metodo con req.user
    @Param('id') userId: number,
    @Res() response: Response,
  ) {
    try {
      const foundUser = await this.userService.getUserById(userId);
      return foundUser
        ? response.status(200).send({
            user: foundUser,
          })
        : response.status(404).json({
            message: `Utente con id ${userId} non trovato`,
          });
    } catch (error) {
      return response.status(500).json({
        message: `Errore nella ricerca dell'utente con id ${userId}`,
        error: error.message,
      });
    }
  }

  @Roles(Role.Admin, Role.Editor)
  @Patch(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) userId: number,
    @Res() response: Response,
    @Body()
    body: {
      username: string;
      email: string;
    },
  ) {
    const { username, email } = body;

    try {
      const foundUser = await this.userService.getUserById(userId);

      if (!foundUser) {
        response.status(404).json({
          message: `Utente con id ${userId} non trovato`,
        });
      }

      if (!username && !email) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          message: "Dati per l'aggiornamento non forniti",
        });
      }

      const updatedUser = await this.userService.updateUser(
        userId,
        username,
        email,
      );
      return response.status(200).json({
        message: 'Utente modificato con successo',
        updatedUser,
      });
    } catch (error) {
      return response.status(500).json({
        message: `Errore nell'aggiornamento dell'utente con id ${userId}`,
        error: error.message,
      });
    }
  }

  @Roles(Role.Admin, Role.Editor)
  @Delete(':id')
  async deleteUserById(
    @Param('id', ParseIntPipe) userId: number,
    @Res() response: Response,
  ) {
    try {
      const foundUser = await this.userService.getUserById(userId);
      if (!foundUser) {
        return response.status(404).json({
          message: `Utente con id ${userId} non trovato`,
        });
      }

      await this.userService.deleteUserById(userId);

      return response.status(200).json({
        message: `Utente con id ${userId} eliminato con successo`,
      });
    } catch (error) {
      return response.status(500).json({
        message: `Errore nella cancellazione dell'utente con id ${userId}`,
        error: error.message,
      });
    }
  }
}
