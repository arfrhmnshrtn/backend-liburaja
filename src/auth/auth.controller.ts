import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards, Patch, Req } from '@nestjs/common';
import { UpdateUserDto } from './dto/update.user.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  update(
    @Req() req: Request & { user: { sub: number } },
    @Body() body: UpdateUserDto,
  ) {
    return this.authService.update(req.user.sub, body);
  }

  @Get('users')
  getAllUser() {
    return this.authService.getAllUser();
  }
}
