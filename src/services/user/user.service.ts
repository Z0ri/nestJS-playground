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

  /**
   * Inserisce gli utenti all'interno del file .csv nel database
   */
  async putUsersInDB(users: UserInterface[]) {
    if (!users || users.length === 0) {
      throw new HttpException(
        'Nessun utente da inserire fornito',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Create user entities
      const userEntities: UserEntity[] = users.map((user) => {
        const userEntity = new UserEntity(
          user.username,
          user.email,
          user.password,
          user.role,
        );
        return userEntity;
      });

      // Save to database
      const savedUsers = await this.writeOnlyUserRepository.save(userEntities);
      return savedUsers;
    } catch (error) {
      throw new HttpException(
        "Errore durante l'inserimento degli utenti",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Permette di ottenere gli utenti nel DB
   */
  async getUsers() {
    return await this.readOnlyUserRepository.find();
  }

  /**
   * Permette di ottenere l'utente nel database con l'id specificato
   */
  async getUserById(userId: number) {
    return await this.readOnlyUserRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  /**
   * Aggiorna un utente
   * @param userId id dell'utente da aggiornare
   * @param newUsername nuovo username dell'utente
   * @param newEmail nuova email dell'utente
   */
  async updateUser(userId: number, newUsername?: string, newEmail?: string) {
    const user = await this.writeOnlyUserRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException(
        `Utente con id ${userId} non trovato`,
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.writeOnlyUserRepository.update(
      { id: userId },
      {
        username: newUsername || user.username,
        email: newEmail || user.email,
      },
    );
  }

  /**
   * Elimina un utente
   * @param userId id dell'utente da eliminare
   */
  async deleteUserById(userId: number) {
    try {
      const user = await this.readOnlyUserRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return await this.writeOnlyUserRepository.remove(user);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
