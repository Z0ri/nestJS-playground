import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';
import { UserInterface } from 'src/interfaces/user.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity, 'writeOnlyConnection')
    private writeOnlyUserRepository: Repository<UserEntity>,

    @InjectRepository(UserEntity, 'readOnlyConnection')
    private readOnlyUserRepository: Repository<UserEntity>,
  ) {}

  async putUsersInDB(users: UserInterface[]) {
    if (!users || users.length === 0) {
      throw new HttpException(
        'Nessun utente da inserire fornito',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const userEntities: UserEntity[] = users.map((user) => {
        if (!user.username || !user.email || !user.password) {
          throw new HttpException(
            'Dati utente incompleti o non validi',
            HttpStatus.BAD_REQUEST,
          );
        }
        return new UserEntity(
          user.username,
          user.email,
          user.password,
          user.money,
          user.role,
        );
      });

      const savedUsers = await this.writeOnlyUserRepository.save(userEntities);
      return savedUsers;
    } catch (error) {
      throw new HttpException(
        `Errore nel salvataggio degli utenti: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUsers() {
    try {
      return await this.readOnlyUserRepository.find();
    } catch (error) {
      throw new HttpException(
        'Errore nella ricerca degli utenti',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await this.readOnlyUserRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new HttpException('Utente non trovato', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        `Errore nella ricerca dell'utente con id ${userId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByKey(userKey: string) {
    try {
      const foundUser = await this.readOnlyUserRepository.findOne({
        where: { key: userKey },
      });

      if (!foundUser) {
        throw new HttpException('Utente non trovato', HttpStatus.NOT_FOUND);
      }

      return foundUser;
    } catch (error) {
      throw new HttpException(
        `Errore nella ricerca dell'utente con key ${userKey}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserByKey(userKey: string, newUsername?: string, newEmail?: string) {
    try {
      const user = await this.writeOnlyUserRepository.findOne({
        where: { key: userKey },
      });

      if (!user) {
        throw new HttpException(
          `Utente con key ${userKey} non trovato`,
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.writeOnlyUserRepository.update(
        { key: userKey },
        { username: newUsername || user.username, email: newEmail || user.email },
      );
    } catch (error) {
      throw new HttpException(
        `Errore nell'aggiornamento dell'utente con key ${userKey}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUserByKey(userKey: string) {
    try {
      const user = await this.readOnlyUserRepository.findOne({
        where: { key: userKey },
      });

      if (!user) {
        throw new HttpException('Utente non trovato', HttpStatus.NOT_FOUND);
      }

      await this.writeOnlyUserRepository.remove(user);
      return { message: `Utente con id ${userKey} eliminato con successo` };
    } catch (error) {
      throw new HttpException(
        `Errore nella cancellazione dell'utente con id ${userKey}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
