import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthMethod, AuthType } from './entities/auth-method.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BindAuthMethodDto } from './dto/bind-auth-method.dto';
import { GitHubAuthDto } from './dto/github-auth.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuthMethod)
    private authMethodRepository: Repository<AuthMethod>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if auth method already exists
    const existingAuth = await this.authMethodRepository.findOne({
      where: {
        auth_type: createUserDto.auth_type,
        auth_identifier: createUserDto.auth_identifier,
      },
    });

    if (existingAuth) {
      throw new ConflictException('Auth method already exists');
    }

    // Create user
    const user = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      role: createUserDto.role,
      reward_address: createUserDto.reward_address,
    });

    await this.userRepository.save(user);

    // Create auth method
    const authMethod = this.authMethodRepository.create({
      user_id: user.user_id,
      auth_type: createUserDto.auth_type,
      auth_identifier: createUserDto.auth_identifier,
    });

    await this.authMethodRepository.save(authMethod);

    return user;
  }

  async findAll() {
    return this.userRepository.find({
      relations: ['auth_methods'],
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['auth_methods'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByAuthMethod(auth_type: AuthType, auth_identifier: string) {
    const authMethod = await this.authMethodRepository.findOne({
      where: {
        auth_type,
        auth_identifier,
      },
      relations: ['user'],
    });

    if (!authMethod) {
      return null;
    }

    return authMethod.user;
  }

  async bindAuthMethod(userId: number, bindAuthMethodDto: BindAuthMethodDto) {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if auth method already exists
    const existingAuth = await this.authMethodRepository.findOne({
      where: {
        auth_type: bindAuthMethodDto.auth_type,
        auth_identifier: bindAuthMethodDto.auth_identifier,
      },
    });

    if (existingAuth) {
      throw new ConflictException('Auth method already exists');
    }

    // Create new auth method
    const authMethod = this.authMethodRepository.create({
      user_id: userId,
      ...bindAuthMethodDto,
    });

    await this.authMethodRepository.save(authMethod);

    return this.findOne(userId);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // GitHub OAuth methods
  async handleGitHubCallback(gitHubAuthDto: GitHubAuthDto) {
    try {
      // Exchange code for access token
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://github.com/login/oauth/access_token',
          {
            client_id: this.configService.get('GITHUB_CLIENT_ID'),
            client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
            code: gitHubAuthDto.code,
          },
          {
            headers: {
              Accept: 'application/json',
            },
          },
        ),
      );

      const accessToken = tokenResponse.data.access_token;

      // Get user data from GitHub
      const userResponse = await firstValueFrom(
        this.httpService.get('https://api.github.com/user', {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        }),
      );

      // Get user email from GitHub
      const emailResponse = await firstValueFrom(
        this.httpService.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        }),
      );

      const primaryEmail = emailResponse.data.find(
        (email: any) => email.primary,
      );

      const githubUser = userResponse.data;
      const githubId = githubUser.id.toString();

      // Check if user already exists
      let user = await this.findByAuthMethod(AuthType.GITHUB, githubId);

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

        user = await this.create(createUserDto);
      }

      // Return user with auth methods
      return this.findOne(user.user_id);
    } catch (error) {
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  getGitHubAuthUrl(redirectUri?: string) {
    const clientId = this.configService.get('GITHUB_CLIENT_ID');
    const callbackUrl = redirectUri || this.configService.get('GITHUB_CALLBACK_URL');
    
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=user:email`;
  }
}
