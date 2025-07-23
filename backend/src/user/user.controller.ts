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
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BindAuthMethodDto } from './dto/bind-auth-method.dto';
import { GitHubAuthDto } from './dto/github-auth.dto';
import { FindByAuthDto } from './dto/find-by-auth.dto';
import { AuthType } from './entities/auth-method.entity';
import { Response } from 'express';
import { Web3ChallengeDto } from './dto/web3-challenge.dto';
import { Web3AuthDto } from './dto/web3-auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { SessionPayload } from '../auth/auth.service';
import { UserRole } from './entities/user.entity';

// 删除这个interface定义
// interface Web3AuthDto {
//   address: string;
//   signature: string;
//   nonce: string;
// }

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(CookieAuthGuard)
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: SessionPayload) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(CookieAuthGuard, RolesGuard)
  @Roles(UserRole.DEVELOPER)
  findAll(@CurrentUser() user: SessionPayload) {
    return this.userService.findAll();
  }

  @Get('by-auth')
  @UseGuards(CookieAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findByAuthMethod(@Query() findByAuthDto: FindByAuthDto, @CurrentUser() user: SessionPayload) {
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
  @UseGuards(CookieAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionPayload) {
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

  @Put(':id')
  @UseGuards(CookieAuthGuard)
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: SessionPayload) {
    try {
      // 直接传递 id 和 updateUserDto，不需要设置 user_id
      return await this.userService.updateUser(id, updateUserDto);
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
  @UseGuards(CookieAuthGuard)
  async bindAuthMethod(
    @Param('id', ParseIntPipe) id: number,
    @Body() bindAuthMethodDto: BindAuthMethodDto,
    @CurrentUser() user: SessionPayload,
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
  @UseGuards(CookieAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionPayload) {
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

      // 设置认证Cookie
      await this.authService.createSession(user, res);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?user_id=${user.user_id}&success=true`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = error instanceof HttpException ? error.message : 'GitHub authentication failed';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  @Post('auth/github/callback')
  async githubCallbackPost(
    @Body() gitHubAuthDto: GitHubAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!gitHubAuthDto.code) {
      throw new HttpException('No authorization code provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.userService.handleGitHubCallback(gitHubAuthDto);

      // 设置认证Cookie
      await this.authService.createSession(user, response);

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

  // 登出接口
  @Post('auth/logout')
  @UseGuards(CookieAuthGuard)
  async logout(@Res({ passthrough: true }) response: Response, @CurrentUser() user: SessionPayload) {
    // 清除认证Cookie
    this.authService.clearSession(response);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  // Web3 认证端点
  @Get('auth/web3/challenge')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getWeb3Challenge(@Query() web3ChallengeDto: Web3ChallengeDto) {
    try {
      return await this.userService.generateWeb3Challenge(web3ChallengeDto.address);
    } catch (error) {
      throw new HttpException(
        'Failed to generate Web3 challenge',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('auth/web3/verify')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async verifyWeb3Auth(
    @Body() web3AuthDto: Web3AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.userService.verifyWeb3Auth(web3AuthDto);

      // 设置认证Cookie
      await this.authService.createSession(result.user, response);

      return {
        success: true,
        action: result.action,
        user: result.user,
        message: result.message,
      };
    } catch (error) {
      const errorMessage = error instanceof HttpException ? error.message : 'Web3 authentication failed';
      throw new HttpException(
        errorMessage,
        error instanceof HttpException ? error.getStatus() : HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
