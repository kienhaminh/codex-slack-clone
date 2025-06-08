/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  constructor(private readonly redis: RedisService) {}

  async getHello(): Promise<string> {
    const cached: string | null = await this.redis.get('hello');
    if (cached) {
      return cached;
    }
    const message = 'Hello World!';
    await this.redis.set('hello', message);
    return message;
  }
}
