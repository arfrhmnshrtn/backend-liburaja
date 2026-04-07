import { Body, Controller, Post, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

type UserPayload = { sub: number; role: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    @CurrentUser() user: UserPayload,
    @Body() body: UpdateUserDto,
  ) {
    return this.authService.update(user.sub, body, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  updateById(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() body: UpdateUserDto,
  ) {
    return this.authService.update(+id, body, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  getAllUser() {
    return this.authService.getAllUser();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admins')
  getAllAdmin() {
    return this.authService.getAllAdmin();
  }
}
