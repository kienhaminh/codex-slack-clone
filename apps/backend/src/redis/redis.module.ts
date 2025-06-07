/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.tokens';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () =>
        new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
