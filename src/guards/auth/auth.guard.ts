import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from 'src/interfaces/requestWithUser.interface';
import { AuthService } from 'src/services/auth/auth.service';
import { extractTokenFromHeader } from 'src/Utils/token.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request && request.headers) {
      const token = extractTokenFromHeader(request); //estraggo il token dall'header della richiesta
      if (!token) {
        throw new UnauthorizedException('Token di autorizzazione non fornito');
      }

      try {
        const user = await this.authService.validateToken(token); //validazione del token e assegnazione
        request.user = user; //imposto l'attributo "user" alla richiesta
        return true;
      } catch {
        throw new UnauthorizedException('Token non valido o scaduto');
      }
    }
  }
}
