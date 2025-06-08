/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { DB } from '../database/database.module';
import { UserController } from './user.controller';
import { USER_SERVICE } from './user.tokens';
import { createUserService } from './user.service';
import { createUserRepository } from './user.repo';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: USER_SERVICE,
      useFactory: (db: any) => {
        const repo = createUserRepository(db);
        return createUserService(repo);
      },
      inject: [DB],
    },
  ],
})
export class UserModule {}
