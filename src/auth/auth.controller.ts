import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards, Patch, Req, Param } from '@nestjs/common';
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
    @Req() req: Request & { user: { sub: number; role: string } },
    @Body() body: UpdateUserDto,
  ) {
    return this.authService.update(req.user.sub, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  updateById(
    @Param('id') id: string,
    @Req() req: Request & { user: { sub: number; role: string } },
    @Body() body: UpdateUserDto,
  ) {
    return this.authService.update(+id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  getAllUser(@Req() req: Request & { user: { sub: number; role: string } }) {
    return this.authService.getAllUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admins')
  getAllAdmin(@Req() req: Request & { user: { sub: number; role: string } }) {
    return this.authService.getAllAdmin(req.user);
  }
}
