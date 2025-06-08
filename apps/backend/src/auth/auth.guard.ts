import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_SERVICE } from './auth.tokens';
import type { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const userId = this.auth.verifyAuthHeader(req.headers.authorization ?? '');
    (req as any).userId = userId;
    return true;
  }
}
