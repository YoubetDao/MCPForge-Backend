import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.userRepository.findOneBy({ github_id: githubId });
  }

  async findOrCreate(githubData: any): Promise<User> {
    const existingUser = await this.findByGithubId(githubData.id.toString());
    if (existingUser) {
      return existingUser;
    }

    const createUserDto: CreateUserDto = {
      github_id: githubData.id.toString(),
      username: githubData.login,
      email: githubData.email,
      avatar_url: githubData.avatar_url,
      github_url: githubData.html_url,
      github_data: githubData,
    };

    return this.create(createUserDto);
  }

  async handleGithubCallback(code: string): Promise<User> {
    try {
      // Exchange code for access token
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://github.com/login/oauth/access_token',
          {
            client_id: this.configService.get('GITHUB_CLIENT_ID'),
            client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
            code,
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
      const userData = {
        ...userResponse.data,
        email: primaryEmail?.email,
      };

      return this.findOrCreate(userData);
    } catch (error) {
      throw new HttpException(
        `GitHub authentication failed: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
