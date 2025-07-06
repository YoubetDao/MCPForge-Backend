import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Res,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BindAuthMethodDto } from './dto/bind-auth-method.dto';
import { GitHubAuthDto } from './dto/github-auth.dto';
import { FindByAuthDto } from './dto/find-by-auth.dto';
import { AuthType } from './entities/auth-method.entity';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('by-auth')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findByAuthMethod(@Query() findByAuthDto: FindByAuthDto) {
    try {
      const user = await this.userService.findByAuthMethod(
        findByAuthDto.auth_type,
        findByAuthDto.auth_identifier
      );
      
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.userService.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/bind-auth')
  async bindAuthMethod(
    @Param('id', ParseIntPipe) id: number,
    @Body() bindAuthMethodDto: BindAuthMethodDto,
  ) {
    try {
      return await this.userService.bindAuthMethod(id, bindAuthMethodDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.userService.remove(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // GitHub OAuth endpoints
  @Get('auth/github')
  githubAuth(@Query('redirect_uri') redirectUri: string, @Res() res: Response) {
    try {
      const authUrl = this.userService.getGitHubAuthUrl(redirectUri);
      res.redirect(authUrl);
    } catch (error) {
      throw new HttpException(
        'Failed to generate GitHub auth URL',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('auth/github/callback')
  async githubCallback(@Query() gitHubAuthDto: GitHubAuthDto, @Res() res: Response) {
    try {
      if (!gitHubAuthDto.code) {
        throw new HttpException('No authorization code provided', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userService.handleGitHubCallback(gitHubAuthDto);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?user_id=${user.user_id}&success=true`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = error instanceof HttpException ? error.message : 'GitHub authentication failed';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  @Post('auth/github/callback')
  async githubCallbackPost(@Body() gitHubAuthDto: GitHubAuthDto) {
    if (!gitHubAuthDto.code) {
      throw new HttpException('No authorization code provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.userService.handleGitHubCallback(gitHubAuthDto);
      return {
        success: true,
        user,
        message: 'GitHub authentication successful',
      };
    } catch (error) {
      const errorMessage = error instanceof HttpException ? error.message : 'GitHub authentication failed';
      throw new HttpException(
        errorMessage,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
