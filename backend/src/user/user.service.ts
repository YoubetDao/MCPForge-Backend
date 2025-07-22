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
import { ethers } from 'ethers';
import { Web3ChallengeDto, Web3ChallengeResponseDto } from './dto/web3-challenge.dto';
import { Web3AuthDto } from './dto/web3-auth.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  // Nonce存储，生产环境建议使用Redis
  private nonceStore = new Map<string, { nonce: string; expires: Date }>();

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

  // Web3 认证方法
  async generateWeb3Challenge(address: string): Promise<Web3ChallengeResponseDto> {
    const normalizedAddress = address.toLowerCase();
    const timestamp = new Date().toISOString();
    const randomId = Math.random().toString(36).substring(2, 15);
    const nonce = `Login to MCPForge at ${timestamp} with nonce: ${randomId}`;
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期
    
    this.nonceStore.set(normalizedAddress, { nonce, expires });
    
    return {
      nonce,
      expires_at: expires.toISOString()
    };
  }

  // 改进后的方法
  async verifyWeb3Auth(web3AuthDto: Web3AuthDto): Promise<{
    success: boolean;
    action: 'login' | 'register';
    user: User;
    message: string;
  }> {
    const address = web3AuthDto.address.toLowerCase();
    
    // 1. 验证 nonce（使用传入的 nonce 而不是存储的）
    const storedChallenge = this.nonceStore.get(address);
    if (!storedChallenge || storedChallenge.expires < new Date()) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }
    
    // 验证传入的 nonce 是否与存储的匹配
    if (storedChallenge.nonce !== web3AuthDto.nonce) {
      throw new UnauthorizedException('Nonce mismatch');
    }
    
    // 2. 验证签名
    const isValidSignature = this.verifySignature(
      web3AuthDto.nonce,  // 使用传入的 nonce
      web3AuthDto.signature,
      web3AuthDto.address
    );
    
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }
    
    // 3. 清除使用过的 nonce
    this.nonceStore.delete(address);
    
    // 4. 查找或创建用户
    let user = await this.findByAuthMethod(AuthType.WEB3, web3AuthDto.address);
    let action: 'login' | 'register';
    
    if (!user) {
      // 新用户注册
      if (!web3AuthDto.username) {
        // throw new BadRequestException('Username is required for new users');
        web3AuthDto.username = address;
      }
      
      const createUserDto: CreateUserDto = {
        username: web3AuthDto.username,
        email: web3AuthDto.email,
        role: web3AuthDto.role || UserRole.USER,  // ✅ 安全的默认值
        reward_address: web3AuthDto.reward_address,
        auth_type: AuthType.WEB3,
        auth_identifier: web3AuthDto.address,
      };
      
      user = await this.create(createUserDto);
      action = 'register';
    } else {
      action = 'login';
    }
    
    const userWithMethods = await this.findOne(user.user_id);
    
    return {
      success: true,
      action,
      user: userWithMethods,
      message: action === 'login' 
        ? 'Web3 authentication successful'
        : 'User registered and authenticated successfully'
    };
  }

  private verifySignature(message: string, signature: string, address: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    // 检查用户是否存在
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  
    // 只更新提供的字段
    const fieldsToUpdate: Partial<User> = {};
    
    if (updateUserDto.username !== undefined) {
      // 检查用户名是否已被其他用户使用
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      
      if (existingUser && existingUser.user_id !== userId) {
        throw new ConflictException('Username already exists');
      }
      
      fieldsToUpdate.username = updateUserDto.username;
    }
    
    if (updateUserDto.email !== undefined) {
      fieldsToUpdate.email = updateUserDto.email;
    }
    
    if (updateUserDto.role !== undefined) {
      fieldsToUpdate.role = updateUserDto.role;
    }
    
    if (updateUserDto.reward_address !== undefined) {
      fieldsToUpdate.reward_address = updateUserDto.reward_address;
    }
  
    // 执行更新
    await this.userRepository.update(userId, fieldsToUpdate);
  
    // 返回更新后的用户信息
    return this.findOne(userId);
  }
}
