import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { AuthMethod, AuthType } from './entities/auth-method.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { GitHubAuthDto } from './dto/github-auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { of } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let authMethodRepository: Repository<AuthMethod>;
  let configService: ConfigService;
  let httpService: HttpService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthMethodRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(AuthMethod),
          useValue: mockAuthMethodRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    authMethodRepository = module.get<Repository<AuthMethod>>(getRepositoryToken(AuthMethod));
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'GITHUB_CLIENT_ID':
          return 'test_client_id';
        case 'GITHUB_CLIENT_SECRET':
          return 'test_client_secret';
        case 'GITHUB_CALLBACK_URL':
          return 'http://localhost:8443/user/auth/github/callback';
        default:
          return undefined;
      }
    });
  });

  describe('GitHub OAuth Integration', () => {
    it('should handle GitHub callback for new user', async () => {
      const githubAuthDto: GitHubAuthDto = {
        code: 'valid_auth_code',
      };

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

      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        auth_methods: [],
      };

      // Mock HTTP calls
      mockHttpService.post.mockReturnValue(of(mockTokenResponse));
      mockHttpService.get
        .mockReturnValueOnce(of(mockUserResponse))
        .mockReturnValueOnce(of(mockEmailResponse));

      // Mock repository calls
      mockAuthMethodRepository.findOne.mockResolvedValue(null); // No existing auth method
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockAuthMethodRepository.create.mockReturnValue({
        auth_id: 1,
        user_id: 1,
        auth_type: AuthType.GITHUB,
        auth_identifier: '12345678',
      });
      mockAuthMethodRepository.save.mockResolvedValue({});

      // Mock findOne to return user with auth methods
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        auth_methods: [
          {
            auth_id: 1,
            user_id: 1,
            auth_type: AuthType.GITHUB,
            auth_identifier: '12345678',
          },
        ],
      });

      const result = await service.handleGitHubCallback(githubAuthDto);

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        {
          client_id: 'test_client_id',
          client_secret: 'test_client_secret',
          code: 'valid_auth_code',
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );
    });

    it('should handle GitHub callback for existing user', async () => {
      const githubAuthDto: GitHubAuthDto = {
        code: 'valid_auth_code',
      };

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

      const existingUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        auth_methods: [
          {
            auth_id: 1,
            user_id: 1,
            auth_type: AuthType.GITHUB,
            auth_identifier: '12345678',
          },
        ],
      };

      // Mock HTTP calls
      mockHttpService.post.mockReturnValue(of(mockTokenResponse));
      mockHttpService.get
        .mockReturnValueOnce(of(mockUserResponse))
        .mockReturnValueOnce(of(mockEmailResponse));

      // Mock existing auth method
      mockAuthMethodRepository.findOne.mockResolvedValue({
        auth_id: 1,
        user_id: 1,
        auth_type: AuthType.GITHUB,
        auth_identifier: '12345678',
        user: existingUser,
      });

      // Mock findOne to return existing user
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.handleGitHubCallback(githubAuthDto);

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(result.user_id).toBe(1);
      expect(mockUserRepository.create).not.toHaveBeenCalled(); // Should not create new user
    });

    it('should handle GitHub callback failure', async () => {
      const githubAuthDto: GitHubAuthDto = {
        code: 'invalid_auth_code',
      };

      // Mock HTTP failure
      mockHttpService.post.mockReturnValue(
        of({
          data: { error: 'invalid_client' },
        })
      );

      await expect(service.handleGitHubCallback(githubAuthDto)).rejects.toThrow(
        'GitHub authentication failed'
      );
    });

    it('should generate GitHub auth URL', () => {
      const redirectUri = 'http://localhost:3000/callback';
      const authUrl = service.getGitHubAuthUrl(redirectUri);

      expect(authUrl).toBe(
        'https://github.com/login/oauth/authorize?client_id=test_client_id&redirect_uri=http://localhost:3000/callback&scope=user:email'
      );
    });

    it('should use default callback URL when no redirect URI provided', () => {
      const authUrl = service.getGitHubAuthUrl();

      expect(authUrl).toBe(
        'https://github.com/login/oauth/authorize?client_id=test_client_id&redirect_uri=http://localhost:8443/user/auth/github/callback&scope=user:email'
      );
    });
  });

  describe('User Creation', () => {
    it('should create a new user with GitHub auth', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        auth_type: AuthType.GITHUB,
        auth_identifier: '12345678',
      };

      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockAuthMethod = {
        auth_id: 1,
        user_id: 1,
        auth_type: AuthType.GITHUB,
        auth_identifier: '12345678',
      };

      mockAuthMethodRepository.findOne.mockResolvedValue(null); // No existing auth method
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockAuthMethodRepository.create.mockReturnValue(mockAuthMethod);
      mockAuthMethodRepository.save.mockResolvedValue(mockAuthMethod);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        reward_address: undefined,
      });
    });

    it('should throw error when auth method already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        auth_type: AuthType.GITHUB,
        auth_identifier: '12345678',
      };

      // Mock existing auth method
      mockAuthMethodRepository.findOne.mockResolvedValue({
        auth_id: 1,
        user_id: 1,
        auth_type: AuthType.GITHUB,
        auth_identifier: '12345678',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Auth method already exists'
      );
    });
  });

  describe('User Lookup', () => {
    it('should find user by auth method', async () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      mockAuthMethodRepository.findOne.mockResolvedValue({
        auth_id: 1,
        user_id: 1,
        auth_type: AuthType.GITHUB,
        auth_identifier: '12345678',
        user: mockUser,
      });

      const result = await service.findByAuthMethod(AuthType.GITHUB, '12345678');

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
    });

    it('should return null when auth method not found', async () => {
      mockAuthMethodRepository.findOne.mockResolvedValue(null);

      const result = await service.findByAuthMethod(AuthType.GITHUB, '12345678');

      expect(result).toBeNull();
    });
  });
}); 