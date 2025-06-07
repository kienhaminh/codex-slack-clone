import RedisMock from 'ioredis-mock';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(() => {
    service = new RedisService(new RedisMock() as unknown as any);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('sets and gets values', async () => {
    await service.set('foo', 'bar');
    await expect(service.get('foo')).resolves.toBe('bar');
  });
});
