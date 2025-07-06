import { Injectable } from '@nestjs/common';
import { GitHubApiMock, MockGitHubUser, MockGitHubEmail } from './github-api.mock';
import { GitHubAuthDto } from '../../src/user/dto/github-auth.dto';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { AuthType } from '../../src/user/entities/auth-method.entity';
import { UserRole } from '../../src/user/entities/user.entity';

export interface MockUser {
  user_id: number;
  username: string;
  email?: string;
  role: UserRole;
  reward_address?: string;
  created_at: Date;
  updated_at: Date;
  auth_methods: MockAuthMethod[];
}

export interface MockAuthMethod {
  auth_id: number;
  user_id: number;
  auth_type: AuthType;
  auth_identifier: string;
  created_at: Date;
}

@Injectable()
export class UserServiceMock {
  private users: MockUser[] = [];
  private authMethods: MockAuthMethod[] = [];
  private nextUserId = 1;
  private nextAuthId = 1;

  constructor(private readonly githubApiMock: GitHubApiMock) {}

  /**
   * Mock GitHub OAuth callback handling
   */
  async handleGitHubCallback(gitHubAuthDto: GitHubAuthDto): Promise<MockUser> {
    try {
      // Exchange code for access token (mocked)
      const tokenData = await this.githubApiMock.exchangeCodeForToken(gitHubAuthDto.code);
      const accessToken = tokenData.access_token;

      // Get user data from GitHub (mocked)
      const githubUser = await this.githubApiMock.getUserData(accessToken);
      const githubEmails = await this.githubApiMock.getUserEmails(accessToken);

      const primaryEmail = githubEmails.find(email => email.primary);
      const githubId = githubUser.id.toString();

      // Check if user already exists
      let user = this.findByAuthMethod(AuthType.GITHUB, githubId);

      if (!user) {
        // Create new user
        const createUserDto: CreateUserDto = {
          username: githubUser.login,
          email: primaryEmail?.email,
          role: undefined, // Will default to 'user'
          reward_address: undefined,
          auth_type: AuthType.GITHUB,
          auth_identifier: githubId,
        };

        user = this.create(createUserDto);
      }

      return user;
    } catch (error) {
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  /**
   * Create a new user with auth method
   */
  create(createUserDto: CreateUserDto): MockUser {
    // Check if auth method already exists
    const existingAuth = this.authMethods.find(
      auth => auth.auth_type === createUserDto.auth_type && 
               auth.auth_identifier === createUserDto.auth_identifier
    );

    if (existingAuth) {
      throw new Error('Auth method already exists');
    }

    // Create user
    const user: MockUser = {
      user_id: this.nextUserId++,
      username: createUserDto.username,
      email: createUserDto.email,
      role: createUserDto.role || UserRole.USER,
      reward_address: createUserDto.reward_address,
      created_at: new Date(),
      updated_at: new Date(),
      auth_methods: []
    };

    this.users.push(user);

    // Create auth method
    const authMethod: MockAuthMethod = {
      auth_id: this.nextAuthId++,
      user_id: user.user_id,
      auth_type: createUserDto.auth_type,
      auth_identifier: createUserDto.auth_identifier,
      created_at: new Date()
    };

    this.authMethods.push(authMethod);
    user.auth_methods.push(authMethod);

    return user;
  }

  /**
   * Find user by auth method
   */
  findByAuthMethod(authType: AuthType, authIdentifier: string): MockUser | null {
    const authMethod = this.authMethods.find(
      auth => auth.auth_type === authType && auth.auth_identifier === authIdentifier
    );

    if (!authMethod) {
      return null;
    }

    const user = this.users.find(u => u.user_id === authMethod.user_id);
    if (!user) {
      return null;
    }

    // Attach auth methods to user
    user.auth_methods = this.authMethods.filter(auth => auth.user_id === user.user_id);
    return user;
  }

  /**
   * Find user by ID
   */
  findOne(id: number): MockUser | null {
    const user = this.users.find(u => u.user_id === id);
    if (!user) {
      return null;
    }

    // Attach auth methods to user
    user.auth_methods = this.authMethods.filter(auth => auth.user_id === user.user_id);
    return user;
  }

  /**
   * Get all users
   */
  findAll(): MockUser[] {
    return this.users.map(user => {
      user.auth_methods = this.authMethods.filter(auth => auth.user_id === user.user_id);
      return user;
    });
  }

  /**
   * Generate GitHub auth URL
   */
  getGitHubAuthUrl(redirectUri?: string): string {
    const clientId = 'test_client_id';
    const callbackUrl = redirectUri || 'http://localhost:8443/user/auth/github/callback';
    return this.githubApiMock.getAuthUrl(clientId, callbackUrl);
  }

  /**
   * Clear all mock data
   */
  clearAll(): void {
    this.users.length = 0;
    this.authMethods.length = 0;
    this.nextUserId = 1;
    this.nextAuthId = 1;
    this.githubApiMock.resetToDefaults();
  }

  /**
   * Get current state for debugging
   */
  getState(): { users: MockUser[], authMethods: MockAuthMethod[] } {
    return {
      users: this.users,
      authMethods: this.authMethods
    };
  }
} 