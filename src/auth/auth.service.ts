import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async getAllUser(userPayload: { sub: number; role: string }) {
    if (userPayload?.role !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak diizinkan melihat data user');
    }
    return await this.prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }).then((data) => {
      return {
        success: true,
        message: 'Get all user berhasil',
        metadata: { status: HttpStatus.OK, count: data.length },
        data,
      };
    });
  }

  getAllAdmin(userPayload: { sub: number; role: string }) {
    if (userPayload?.role !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak diizinkan melihat data admin');
    }
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }).then((data) => {
      return {
        success: true,
        message: 'Get all admin berhasil',
        metadata: { status: HttpStatus.OK, count: data.length },
        data,
      };
    });
  }
  

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return {
      message: 'Register berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      status: 200,
      message: 'Login berhasil',
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  logout() {
    return {
      success: true,
      status: 200,
      message: 'Logout berhasil',
    };
  }

  async update(userId: number, data: UpdateUserDto, userPayload: { sub: number; role: string }) {
    const targetId = parseInt(userId as any, 10);
    const requestorId = parseInt(userPayload?.sub as any, 10);

    if (targetId !== requestorId && userPayload?.role !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak diizinkan mengubah data pengguna lain');
    }

    const updateData: Partial<UpdateUserDto> = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updateData.password = hashedPassword;
    }

    return this.prisma.user
      .update({
        where: { id: userId },
        data: updateData,
      })
      .then((updateData) => {
        return {
          success: true,
          status: 200,
          message: 'Update user berhasil',
          data: updateData,
        };
      });
  }
}
