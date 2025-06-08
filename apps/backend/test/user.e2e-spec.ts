import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { USER_SERVICE } from '../src/user/user.tokens';
import type { UserService } from '../src/user/user.service';
import { AuthGuard } from '../src/auth/auth.guard';
import { RedisService } from '../src/redis/redis.service';
import RedisMock from 'ioredis-mock';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const service: jest.Mocked<UserService> = {
    getCurrentUser: jest.fn(async () => ({
      id: 1,
      email: 'e',
      passwordHash: null,
      googleId: null,
      name: 'A',
      avatarUrl: null,
    })),
    updateProfile: jest.fn(async () => ({
      id: 1,
      email: 'e',
      passwordHash: null,
      googleId: null,
      name: 'B',
      avatarUrl: null,
    })),
    uploadAvatar: jest.fn(async () => ({
      id: 1,
      email: 'e',
      passwordHash: null,
      googleId: null,
      name: 'A',
      avatarUrl: 'p',
    })),
  } as unknown as jest.Mocked<UserService>;

  beforeEach(async () => {
    const redisService = new RedisService(new (RedisMock as any)());
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useValue(redisService)
      .overrideProvider(USER_SERVICE)
      .useValue(service)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate(ctx: ExecutionContext) {
          const req = ctx.switchToHttp().getRequest();
          (req as any).userId = 1;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/me (GET)', () => {
    return request(app.getHttpServer()).get('/users/me').expect(200).expect({
      id: 1,
      email: 'e',
      passwordHash: null,
      googleId: null,
      name: 'A',
      avatarUrl: null,
    });
  });

  it('/users/me (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/users/me')
      .send({ name: 'B' })
      .expect(200)
      .expect({
        id: 1,
        email: 'e',
        passwordHash: null,
        googleId: null,
        name: 'B',
        avatarUrl: null,
      });
  });

  it('/users/me/avatar (POST)', () => {
    return request(app.getHttpServer())
      .post('/users/me/avatar')
      .send({ avatarUrl: 'p' })
      .expect(200)
      .expect({
        id: 1,
        email: 'e',
        passwordHash: null,
        googleId: null,
        name: 'A',
        avatarUrl: 'p',
      });
  });
});
