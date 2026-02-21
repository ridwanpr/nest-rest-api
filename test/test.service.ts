import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createUser() {
    const password = await bcrypt.hash('12345678', 10);
    await this.prismaService.user.create({
      data: {
        username: 'test',
        name: 'test',
        password: password,
      },
    });
  }
}
