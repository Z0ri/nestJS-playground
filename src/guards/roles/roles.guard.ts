import {
  CanActivate,
  HttpException,
  HttpStatus,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/decorators/roles/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const user = request.user; //utente nella richiesta inserito nell'auth guard
    console.log('user: ', user);
    if (!user) {
      throw new HttpException('Utente non autenticato', HttpStatus.FORBIDDEN);
    }

    if (requiredRoles.includes(user.role)) {
      return true;
    } else {
      throw new HttpException(
        'Permessi non sufficenti',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
