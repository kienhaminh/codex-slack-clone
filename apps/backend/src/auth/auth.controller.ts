import { Body, Controller, Post, UseGuards, Req, Inject } from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_SERVICE } from './auth.tokens';
import type { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string }) {
    return this.auth.register(body.email, body.password, body.name);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Post('logout')
  logout(@Body() body: { refreshToken: string }) {
    return this.auth.logout(body.refreshToken);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Post('change-password')
  changePassword(@Body() body: { token: string; newPassword: string }) {
    return this.auth.changePassword(body.token, body.newPassword);
  }

  @Post('google')
  google() {
    throw new Error('Not implemented');
  }

  @Post('me')
  @UseGuards(AuthGuard)
  me(@Req() req: Request) {
    return { userId: (req as any).userId };
  }
}
