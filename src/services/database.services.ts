import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      // Configure connection pooling
      log: ['error', 'warn'],
    });

    // Handle shutdown gracefully
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, async () => {
        await this.prisma.$disconnect();
        process.exit(0);
      });
    });

    // Handle uncaught errors
    process.on('unhandledRejection', async (e) => {
      console.error(e);
      await this.prisma.$disconnect();
      process.exit(1);
    });
  }

  // Add connection management methods
  async connect() {
    try {
      await this.prisma.$connect();
      console.log('Successfully connected to database');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  // Modify createWallpaper to handle connections better
  async createWallpaper(data: {
    publicId: string;
    name: string;
    width: number;
    height: number;
    format: string;
    previewUrl: string;
    downloadUrl: string;
    tags: string[];
    colors: string[];
  }) {
    try {
      // First check if wallpaper with this publicId exists
      const existing = await this.prisma.wallpaper.findUnique({
        where: { publicId: data.publicId },
        include: { tags: true, colors: true }
      });

      if (existing) {
        // Update existing wallpaper
        return await this.prisma.wallpaper.update({
          where: { publicId: data.publicId },
          data: {
            name: data.name,
            width: data.width,
            height: data.height,
            format: data.format,
            previewUrl: data.previewUrl,
            downloadUrl: data.downloadUrl,
            tags: {
              connectOrCreate: data.tags.map(tag => ({
                where: { name: tag },
                create: { name: tag }
              }))
            },
            colors: {
              connectOrCreate: data.colors.map(color => ({
                where: { hex: color },
                create: { hex: color }
              }))
            }
          },
          include: {
            tags: true,
            colors: true
          }
        });
      }

      // Create new wallpaper with transaction
      return await this.prisma.$transaction(async (prisma: { wallpaper: { create: (arg0: { data: { publicId: string; name: string; width: number; height: number; format: string; previewUrl: string; downloadUrl: string; tags: { connectOrCreate: { where: { name: string; }; create: { name: string; }; }[]; }; colors: { connectOrCreate: { where: { hex: string; }; create: { hex: string; }; }[]; }; }; include: { tags: boolean; colors: boolean; }; }) => any; }; }) => {
        return prisma.wallpaper.create({
          data: {
            publicId: data.publicId,
            name: data.name,
            width: data.width,
            height: data.height,
            format: data.format,
            previewUrl: data.previewUrl,
            downloadUrl: data.downloadUrl,
            tags: {
              connectOrCreate: data.tags.map(tag => ({
                where: { name: tag },
                create: { name: tag }
              }))
            },
            colors: {
              connectOrCreate: data.colors.map(color => ({
                where: { hex: color },
                create: { hex: color }
              }))
            }
          },
          include: {
            tags: true,
            colors: true
          }
        });
      });
    } catch (error) {
      console.error('Error in createWallpaper:', error);
      throw error;
    }
  }

    async deleteWallpaper(publicId: string) {
        return this.prisma.wallpaper.delete({
            where: { publicId }
        });
    }

    async getAllWallpapers(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [wallpapers, total] = await Promise.all([
            this.prisma.wallpaper.findMany({
                skip,
                take: limit,
                include: {
                    tags: true,
                    colors: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.wallpaper.count()
        ]);

        return {
            data: wallpapers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    }

    async getWallpaperById(publicId: string) {
        return this.prisma.wallpaper.findUnique({
            where: { publicId },
            include: {
                tags: true,
                colors: true
            }
        });
    }

    async searchWallpapers(query: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [wallpapers, total] = await Promise.all([
            this.prisma.wallpaper.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } }
                    ]
                },
                skip,
                take: limit,
                include: {
                    tags: true,
                    colors: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.wallpaper.count({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } }
                    ]
                }
            })
        ]);

        return {
            data: wallpapers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    }

    async incrementDownloads(publicId: string) {
        return this.prisma.wallpaper.update({
            where: { publicId },
            data: {
                downloads: {
                    increment: 1
                }
            }
        });
    }

    async filterWallpapers(filters: {
        tags?: string[];
        colors?: string[];
        min_width?: number;
        max_width?: number;
        min_height?: number;
        max_height?: number;
        format?: string;
    }, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (filters.tags?.length) {
            where.tags = { some: { name: { in: filters.tags } } };
        }
        if (filters.colors?.length) {
            where.colors = { some: { hex: { in: filters.colors } } };
        }
        if (filters.min_width) where.width = { gte: filters.min_width };
        if (filters.max_width) where.width = { ...where.width, lte: filters.max_width };
        if (filters.min_height) where.height = { gte: filters.min_height };
        if (filters.max_height) where.height = { ...where.height, lte: filters.max_height };
        if (filters.format) where.format = filters.format;

        const [wallpapers, total] = await Promise.all([
            this.prisma.wallpaper.findMany({
                where,
                skip,
                take: limit,
                include: {
                    tags: true,
                    colors: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.wallpaper.count({ where })
        ]);

        return {
            data: wallpapers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    }
}