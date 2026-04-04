import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { PrismaService } from 'src/prisma.service';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, packageId: number) {
    // cek duplicate
    const existing = await this.prisma.bookmark.findMany({
      where: { userId, packageId },
    });

    if (existing.length > 0) {
      throw new BadRequestException('Sudah di-bookmark');
    }

    const result = await this.prisma.bookmark.create({
      data: {
        userId,
        packageId,
      },
    });

    return {
      success: true,
      message: 'Bookmark berhasil dibuat',
      metadata: {
        status: HttpStatus.CREATED,
      },
    };
  }

  async findAll(userId: number) {
    // return `This action returns all bookmarks`;
    const data = await this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        package: true,
      },
    });
    return {
      success: true,
      message: 'Berhasil mengambil semua bookmark',
      metadata: {
        status: HttpStatus.OK,
        count: data.length,
      },
      data,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} bookmark`;
  }

  update(id: number, updateBookmarkDto: UpdateBookmarkDto) {
    return `This action updates a #${id} bookmark`;
  }

  async remove(id: number) {
    // return
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark) {
      throw new BadRequestException('Bookmark tidak ditemukan');
    }
    const result = await this.prisma.bookmark.delete({
      where: { id },
    });
    // return `This action removes a #${id} bookmark`;
    return {
      success: true,
      message: 'Bookmark berhasil dihapus',
      data: result,
    };
  }
}
