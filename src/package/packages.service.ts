import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PrismaService } from 'src/prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class PackagesService {
  async create(createPackageDto: CreatePackageDto) {
    // return 'This action adds a new package';

    await new PrismaService().package.create({
      data: {
        name: createPackageDto.name,
        description: createPackageDto.description,
        price: createPackageDto.price,
        location: createPackageDto.location,
        image: createPackageDto.image,
      },
    });

    return {
      success: true,
      message: 'Paket berhasil dibuat',
      metadata: {
        status: HttpStatus.CREATED,
      },
    };
  }

  async findAll() {
    // return `This action returns all packages`;
    const data = await new PrismaService().package.findMany();
    // console.log(data);
    return {
      success: true,
      message: 'Berhasil mengambil data paket',
      metadata: {
        status: HttpStatus.OK,
        total_data: data.length,
      },
      data,
    };
  }

  async findOne(id: number) {
    // return `This action returns a #${id} package`;
    const data = await new PrismaService().package.findUnique({
      where: { id },
    });

    return {
      success: true,
      message: 'Berhasil mengambil data paket',
      metadata: {
        status: HttpStatus.OK,
      },
      data,
    };
  }

  update(id: number, updatePackageDto: UpdatePackageDto) {
    return `This action updates a #${id} package`;
  }

  async remove(id: number) {
    try {
      await new PrismaService().package.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Paket berhasil dihapus',
        metadata: {
          status: HttpStatus.OK,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        success: false,
        message: 'parameter id tidak valid',
        metadata: {
          status: HttpStatus.BAD_REQUEST,
        },
      });
    }
  }
}
