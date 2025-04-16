import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { FiltersInput } from './inputs/filters.input';

@Injectable()
export class StreamService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findAll(input: FiltersInput = {}) {
    const { take, skip, searchTerm } = input;

    const whereClause = searchTerm
      ? this.findBySearchTermFilter(searchTerm)
      : undefined;

    const streams = await this.prismaService.stream.findMany({
      take: take ?? 12,
      skip: skip ?? 0,
      where: {
        user: { isDeactivated: false },
        ...whereClause
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return streams;
  }

  public async findRandom() {
    const total = await this.prismaService.stream.count({
      where: {
        user: { isDeactivated: false }
      }
    });

    const randomIndexes = new Set<number>();
    while (randomIndexes.size < (total > 4 ? 4 : total)) {
      const randomIndex = Math.floor(Math.random() * total);
      randomIndexes.add(randomIndex);
    }

    const streams = await this.prismaService.stream.findMany({
      where: {
        user: { isDeactivated: false }
      },
      include: {
        user: true
      },
      skip: 0,
      take: total
    });

    return Array.from(randomIndexes).map(index => streams[index]);
  }

  private findBySearchTermFilter(searchTerm: string): Prisma.StreamWhereInput {
    return {
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          user: {
            username: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        }
      ]
    };
  }
}
