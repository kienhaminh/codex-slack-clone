import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import type { Request } from 'express';
import { USER_SERVICE } from './user.tokens';
import type { UserService } from './user.types';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(@Inject(USER_SERVICE) private readonly service: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: Request) {
    return this.service.getCurrentUser((req as any).userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  update(@Body() body: { name: string }, @Req() req: Request) {
    return this.service.updateProfile((req as any).userId, { name: body.name });
  }

  @Post('me/avatar')
  @UseGuards(AuthGuard)
  uploadAvatar(@Body() body: { avatarUrl: string }, @Req() req: Request) {
    return this.service.uploadAvatar((req as any).userId, body.avatarUrl);
  }
}
