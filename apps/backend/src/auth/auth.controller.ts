import {
  Body,
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { OmitUser, RequestWithGoogleUser } from './interfaces/auth.interface';
import { Request, Response } from 'express';
import { Public } from './decorator/public.decorator';
import { RefreshJwtAuthGuard } from './guard/refresh-jwt-auth.guard';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth() {
    // Initiates the Google OAuth 2.0 flow
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(
    @Req() req: RequestWithGoogleUser,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.validateGoogleUser(req.user);
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/login?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    );
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Body() authRegisterDto: AuthRegisterDto,
  ): Promise<OmitUser> | never {
    return this.authService.register(authRegisterDto);
  }

  @Public()
  @Post('login')
  login(
    @Body() authLoginDto: AuthLoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> | never {
    return this.authService.login(authLoginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request) {
    const user = req.user;
    return this.authService.logout(user['sub']);
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @Req() req: Request,
  ): Promise<{ access_token: string; refresh_token: string }> | never {
    const user = req.user;

    return this.authService.refreshTokens(user['sub'], user['refreshToken']);
  }
}
