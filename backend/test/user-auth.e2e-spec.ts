import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/user/entities/user.entity';
import { AuthMethod } from '../src/user/entities/auth-method.entity';
import { Repository } from 'typeorm';
import { of } from 'rxjs';

describe('User Authentication (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let userRepository: Repository<User>;
  let authMethodRepository: Repository<AuthMethod>;
  let httpService: HttpService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        post: jest.fn(),
        get: jest.fn(),
      })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockImplementation((key: string) => {
          switch (key) {
            case 'GITHUB_CLIENT_ID':
              return 'test_client_id';
            case 'GITHUB_CLIENT_SECRET':
              return 'test_client_secret';
            case 'GITHUB_CALLBACK_URL':
              return 'http://localhost:8443/user/auth/github/callback';
            case 'FRONTEND_URL':
              return 'http://localhost:3000';
            default:
              return undefined;
          }
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    authMethodRepository = moduleFixture.get<Repository<AuthMethod>>(getRepositoryToken(AuthMethod));
    httpService = moduleFixture.get<HttpService>(HttpService);
  });

  afterEach(async () => {
    // Clean up database
    await authMethodRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/user/auth/github (GET)', () => {
    it('should redirect to GitHub authorization URL', () => {
      return request(app.getHttpServer())
        .get('/user/auth/github')
        .expect(302)
        .expect('Location', /^https:\/\/github\.com\/login\/oauth\/authorize\?client_id=test_client_id/);
    });

    it('should redirect to GitHub with custom redirect URI', () => {
      const customRedirectUri = 'http://localhost:3000/custom-callback';
      return request(app.getHttpServer())
        .get('/user/auth/github')
        .query({ redirect_uri: customRedirectUri })
        .expect(302)
        .expect('Location', new RegExp(`redirect_uri=${encodeURIComponent(customRedirectUri)}`));
    });
  });

  describe('/user/auth/github/callback (GET)', () => {
    it('should handle successful GitHub callback and redirect to frontend', async () => {
      // Mock GitHub API responses
      const mockTokenResponse = {
        data: { access_token: 'mock_access_token' },
      };

      const mockUserResponse = {
        data: {
          id: 12345678,
          login: 'testuser',
          name: 'Test User',
        },
      };

      const mockEmailResponse = {
        data: [
          { email: 'test@example.com', primary: true, verified: true },
        ],
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockTokenResponse));
      jest.spyOn(httpService, 'get')
        .mockReturnValueOnce(of(mockUserResponse))
        .mockReturnValueOnce(of(mockEmailResponse));

      const response = await request(app.getHttpServer())
        .get('/user/auth/github/callback')
        .query({ code: 'valid_auth_code' })
        .expect(302);

      expect(response.headers.location).toMatch(/^http:\/\/localhost:3000\/auth\/callback\?user_id=\d+&success=true$/);

      // Verify user was created in database
      const users = await userRepository.find({ relations: ['auth_methods'] });
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('testuser');
      expect(users[0].email).toBe('test@example.com');
      expect(users[0].auth_methods).toHaveLength(1);
      expect(users[0].auth_methods[0].auth_type).toBe('github');
      expect(users[0].auth_methods[0].auth_identifier).toBe('12345678');
    });

    it('should handle GitHub callback error and redirect to frontend with error', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/auth/github/callback')
        .query({ code: 'invalid_auth_code' })
        .expect(302);

      expect(response.headers.location).toMatch(/^http:\/\/localhost:3000\/auth\/callback\?error=/);
    });

    it('should handle missing authorization code', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/auth/github/callback')
        .expect(302);

      expect(response.headers.location).toMatch(/^http:\/\/localhost:3000\/auth\/callback\?error=/);
    });

    it('should handle existing user login', async () => {
      // Create existing user
      const existingUser = userRepository.create({
        username: 'existinguser',
        email: 'existing@example.com',
        role: 'user',
      });
      await userRepository.save(existingUser);

      const existingAuth = authMethodRepository.create({
        user_id: existingUser.user_id,
        auth_type: 'github',
        auth_identifier: '87654321',
      });
      await authMethodRepository.save(existingAuth);

      // Mock GitHub API responses for existing user
      const mockTokenResponse = {
        data: { access_token: 'mock_access_token' },
      };

      const mockUserResponse = {
        data: {
          id: 87654321,
          login: 'existinguser',
          name: 'Existing User',
        },
      };

      const mockEmailResponse = {
        data: [
          { email: 'existing@example.com', primary: true, verified: true },
        ],
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockTokenResponse));
      jest.spyOn(httpService, 'get')
        .mockReturnValueOnce(of(mockUserResponse))
        .mockReturnValueOnce(of(mockEmailResponse));

      const response = await request(app.getHttpServer())
        .get('/user/auth/github/callback')
        .query({ code: 'valid_auth_code' })
        .expect(302);

      expect(response.headers.location).toMatch(/^http:\/\/localhost:3000\/auth\/callback\?user_id=\d+&success=true$/);

      // Verify no new user was created
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('existinguser');
    });
  });

  describe('/user/auth/github/callback (POST)', () => {
    it('should handle successful GitHub callback via POST', async () => {
      // Mock GitHub API responses
      const mockTokenResponse = {
        data: { access_token: 'mock_access_token' },
      };

      const mockUserResponse = {
        data: {
          id: 12345678,
          login: 'testuser',
          name: 'Test User',
        },
      };

      const mockEmailResponse = {
        data: [
          { email: 'test@example.com', primary: true, verified: true },
        ],
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockTokenResponse));
      jest.spyOn(httpService, 'get')
        .mockReturnValueOnce(of(mockUserResponse))
        .mockReturnValueOnce(of(mockEmailResponse));

      const response = await request(app.getHttpServer())
        .post('/user/auth/github/callback')
        .send({ code: 'valid_auth_code' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.message).toBe('GitHub authentication successful');

      // Verify user was created in database
      const users = await userRepository.find({ relations: ['auth_methods'] });
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('testuser');
    });

    it('should handle GitHub callback error via POST', async () => {
      // Mock GitHub API error
      jest.spyOn(httpService, 'post').mockImplementation(() => {
        throw new Error('GitHub API error');
      });

      const response = await request(app.getHttpServer())
        .post('/user/auth/github/callback')
        .send({ code: 'invalid_auth_code' })
        .expect(401);

      expect(response.body.message).toContain('GitHub authentication failed');
    });

    it('should handle missing authorization code in POST', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/auth/github/callback')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('No authorization code provided');
    });
  });

  describe('/user/by-auth (GET)', () => {
    it('should find user by GitHub auth method', async () => {
      // Create test user
      const testUser = userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      });
      await userRepository.save(testUser);

      const testAuth = authMethodRepository.create({
        user_id: testUser.user_id,
        auth_type: 'github',
        auth_identifier: '12345678',
      });
      await authMethodRepository.save(testAuth);

      const response = await request(app.getHttpServer())
        .get('/user/by-auth')
        .query({
          auth_type: 'github',
          auth_identifier: '12345678',
        })
        .expect(200);

      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 404 when user not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/by-auth')
        .query({
          auth_type: 'github',
          auth_identifier: '99999999',
        })
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should validate auth_type parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/by-auth')
        .query({
          auth_type: 'invalid_type',
          auth_identifier: '12345678',
        })
        .expect(400);

      expect(response.body.message).toContain('auth_type must be one of');
    });
  });

  describe('/user (POST)', () => {
    it('should create user with GitHub auth method', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        role: 'user',
        auth_type: 'github',
        auth_identifier: '11111111',
      };

      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(201);

      expect(response.body.username).toBe('newuser');
      expect(response.body.email).toBe('new@example.com');

      // Verify user was created in database
      const users = await userRepository.find({ relations: ['auth_methods'] });
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('newuser');
      expect(users[0].auth_methods).toHaveLength(1);
      expect(users[0].auth_methods[0].auth_type).toBe('github');
    });

    it('should handle duplicate auth method', async () => {
      // Create first user
      const firstUser = userRepository.create({
        username: 'firstuser',
        email: 'first@example.com',
        role: 'user',
      });
      await userRepository.save(firstUser);

      const firstAuth = authMethodRepository.create({
        user_id: firstUser.user_id,
        auth_type: 'github',
        auth_identifier: '12345678',
      });
      await authMethodRepository.save(firstAuth);

      // Try to create second user with same auth method
      const createUserDto = {
        username: 'seconduser',
        email: 'second@example.com',
        role: 'user',
        auth_type: 'github',
        auth_identifier: '12345678',
      };

      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(409);

      expect(response.body.message).toBe('Auth method already exists');
    });
  });

  describe('/user/:id/bind-auth (POST)', () => {
    it('should bind additional auth method to existing user', async () => {
      // Create test user
      const testUser = userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      });
      await userRepository.save(testUser);

      const bindAuthDto = {
        auth_type: 'github',
        auth_identifier: '12345678',
      };

      const response = await request(app.getHttpServer())
        .post(`/user/${testUser.user_id}/bind-auth`)
        .send(bindAuthDto)
        .expect(201);

      expect(response.body.username).toBe('testuser');
      expect(response.body.auth_methods).toHaveLength(1);
      expect(response.body.auth_methods[0].auth_type).toBe('github');
    });

    it('should handle binding duplicate auth method', async () => {
      // Create first user with auth method
      const firstUser = userRepository.create({
        username: 'firstuser',
        email: 'first@example.com',
        role: 'user',
      });
      await userRepository.save(firstUser);

      const firstAuth = authMethodRepository.create({
        user_id: firstUser.user_id,
        auth_type: 'github',
        auth_identifier: '12345678',
      });
      await authMethodRepository.save(firstAuth);

      // Create second user
      const secondUser = userRepository.create({
        username: 'seconduser',
        email: 'second@example.com',
        role: 'user',
      });
      await userRepository.save(secondUser);

      // Try to bind same auth method to second user
      const bindAuthDto = {
        auth_type: 'github',
        auth_identifier: '12345678',
      };

      const response = await request(app.getHttpServer())
        .post(`/user/${secondUser.user_id}/bind-auth`)
        .send(bindAuthDto)
        .expect(409);

      expect(response.body.message).toBe('Auth method already exists');
    });
  });
}); 