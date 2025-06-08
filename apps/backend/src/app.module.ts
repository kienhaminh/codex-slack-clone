/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [DatabaseModule, RedisModule, AuthModule, WorkspaceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
