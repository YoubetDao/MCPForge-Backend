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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BindAuthMethodDto } from './dto/bind-auth-method.dto';
import { GitHubAuthDto } from './dto/github-auth.dto';
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
  findByAuthMethod(
    @Query('auth_type') authType: AuthType,
    @Query('auth_identifier') authIdentifier: string,
  ) {
    return this.userService.findByAuthMethod(authType, authIdentifier);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post(':id/bind-auth')
  bindAuthMethod(
    @Param('id', ParseIntPipe) id: number,
    @Body() bindAuthMethodDto: BindAuthMethodDto,
  ) {
    return this.userService.bindAuthMethod(id, bindAuthMethodDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  // GitHub OAuth endpoints
  @Get('auth/github')
  githubAuth(@Query('redirect_uri') redirectUri: string, @Res() res: Response) {
    const authUrl = this.userService.getGitHubAuthUrl(redirectUri);
    res.redirect(authUrl);
  }

  @Get('auth/github/callback')
  async githubCallback(@Query() gitHubAuthDto: GitHubAuthDto, @Res() res: Response) {
    try {
      if (!gitHubAuthDto.code) {
        throw new HttpException('No authorization code provided', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userService.handleGitHubCallback(gitHubAuthDto);
      
      // In a real application, you would generate a JWT token here
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Redirect to frontend with user info or token
      res.redirect(`${frontendUrl}/auth/callback?user_id=${user.user_id}&success=true`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message)}`);
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
      throw new HttpException(
        `GitHub authentication failed: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
