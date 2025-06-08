/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { DB, DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AUTH_SERVICE } from './auth.tokens';
import { createAuthService } from './auth.service';
import { createAuthRepository } from './auth.repo';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: (db: any) => {
        const repo = createAuthRepository(db);
        return createAuthService(repo, process.env.JWT_SECRET ?? 'secret');
      },
      inject: [DB],
    },
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
