import { Injectable } from '@nestjs/common';

export interface MockGitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface MockGitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

@Injectable()
export class GitHubApiMock {
  // Mock GitHub users for testing
  private mockUsers: MockGitHubUser[] = [
    {
      id: 12345678,
      login: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: 'https://github.com/testuser.png'
    },
    {
      id: 87654321,
      login: 'developer',
      name: 'Developer User',
      email: 'dev@example.com',
      avatar_url: 'https://github.com/developer.png'
    }
  ];

  private mockEmails: Record<number, MockGitHubEmail[]> = {
    12345678: [
      { email: 'test@example.com', primary: true, verified: true },
      { email: 'test2@example.com', primary: false, verified: true }
    ],
    87654321: [
      { email: 'dev@example.com', primary: true, verified: true }
    ]
  };

  // Mock access tokens
  private mockTokens: Record<string, string> = {
    'valid_auth_code': 'mock_access_token_123',
    'valid_auth_code_2': 'mock_access_token_456'
  };

  // Mock user sessions
  private mockSessions: Record<string, number> = {
    'mock_access_token_123': 12345678,
    'mock_access_token_456': 87654321
  };

  /**
   * Mock GitHub OAuth token exchange
   */
  async exchangeCodeForToken(code: string): Promise<{ access_token: string }> {
    const token = this.mockTokens[code];
    if (!token) {
      throw new Error('Invalid authorization code');
    }
    
    return { access_token: token };
  }

  /**
   * Mock GitHub user data fetch
   */
  async getUserData(accessToken: string): Promise<MockGitHubUser> {
    const userId = this.mockSessions[accessToken];
    if (!userId) {
      throw new Error('Invalid access token');
    }

    const user = this.mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Mock GitHub user emails fetch
   */
  async getUserEmails(accessToken: string): Promise<MockGitHubEmail[]> {
    const userId = this.mockSessions[accessToken];
    if (!userId) {
      throw new Error('Invalid access token');
    }

    return this.mockEmails[userId] || [];
  }

  /**
   * Get mock authorization URL
   */
  getAuthUrl(clientId: string, redirectUri: string): string {
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  }

  /**
   * Add a new mock user for testing
   */
  addMockUser(user: MockGitHubUser, emails: MockGitHubEmail[], authCode: string, accessToken: string): void {
    this.mockUsers.push(user);
    this.mockEmails[user.id] = emails;
    this.mockTokens[authCode] = accessToken;
    this.mockSessions[accessToken] = user.id;
  }

  /**
   * Clear all mock data
   */
  clearMockData(): void {
    this.mockUsers.length = 0;
    Object.keys(this.mockEmails).forEach(key => delete this.mockEmails[key]);
    Object.keys(this.mockTokens).forEach(key => delete this.mockTokens[key]);
    Object.keys(this.mockSessions).forEach(key => delete this.mockSessions[key]);
  }

  /**
   * Reset to default mock data
   */
  resetToDefaults(): void {
    this.clearMockData();
    
    // Re-add default users
    this.mockUsers.push(
      {
        id: 12345678,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://github.com/testuser.png'
      },
      {
        id: 87654321,
        login: 'developer',
        name: 'Developer User',
        email: 'dev@example.com',
        avatar_url: 'https://github.com/developer.png'
      }
    );

    // Re-add default emails
    this.mockEmails[12345678] = [
      { email: 'test@example.com', primary: true, verified: true },
      { email: 'test2@example.com', primary: false, verified: true }
    ];
    this.mockEmails[87654321] = [
      { email: 'dev@example.com', primary: true, verified: true }
    ];

    // Re-add default tokens
    this.mockTokens['valid_auth_code'] = 'mock_access_token_123';
    this.mockTokens['valid_auth_code_2'] = 'mock_access_token_456';

    // Re-add default sessions
    this.mockSessions['mock_access_token_123'] = 12345678;
    this.mockSessions['mock_access_token_456'] = 87654321;
  }
} 