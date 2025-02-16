import { PrismaClient } from '@prisma/client';
import { WallpaperFilters } from '../types/wallpaper';

export class DatabaseService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

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
        return this.prisma.wallpaper.create({
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

    async getWallpaperById(id: string) {
        return this.prisma.wallpaper.findUnique({
            where: { publicId: id },
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

    async incrementDownloads(id: string) {
        return this.prisma.wallpaper.update({
            where: { publicId: id },
            data: { downloads: { increment: 1 } }
        });
    }

    async filterWallpapers(filters: WallpaperFilters, page: number = 1, limit: number = 20) {
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