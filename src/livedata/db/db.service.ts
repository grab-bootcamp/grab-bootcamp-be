import { Injectable } from '@nestjs/common';
import { Forest,PrismaClient } from '@prisma/client';
import { boolean } from 'joi';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class DbService {

 constructor(private prisma: PrismaService) {
 }
  async getAllForest(): Promise<Forest[]> {
    return this.prisma.forest.findMany();
  }

  async getForest(id: number): Promise<Forest | null> {
    return this.prisma.forest.findUnique({ where: { mId: Number(id) } });
  }
  async createForest(data: Forest): Promise<Forest> {
    return this.prisma.forest.create({
      data,
    });
  }
  async updateForest(id: number,data:string): Promise<Forest> {
    return this.prisma.forest.update({
      where: { mId: Number(id) },
      data: {mCoordinates: data}

    });
  }
  async deleteForest(id: number): Promise<Forest> {
    return this.prisma.forest.delete({
      where: { mId: Number(id) },
    });
  }
}
