import { Request, Response } from 'express';
import { WallpaperScanner } from '../utils/wallpaperScanner';
import { config } from '../config';
import fs from 'fs-extra';
import rateLimit from 'express-rate-limit';
import { SortOptions, WallpaperFilters } from '../types/wallpaper';

const scanner = new WallpaperScanner();

const now = new Date();
const CURRENT_USER = 'user';
const CURRENT_TIMESTAMP = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;


// Rate limiting middleware
export const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30 // limit each IP to 30 downloads per windowMs
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100 // limit each IP to 100 requests per windowMs
});

// export const getWallpapers = async (req: Request, res: Response) => {
//   try {
//     const wallpapers = scanner.getAllWallpapers();
//     res.json(wallpapers);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// Core Endpoints
export const getWallpapers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const wallpapers = scanner.getAllWallpapers();
        const start = (page - 1) * limit;
        const end = start + limit;

        const paginatedWallpapers = wallpapers.slice(start, end);

        res.json({
            data: paginatedWallpapers,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(wallpapers.length / limit),
                total_items: wallpapers.length,
                items_per_page: limit
            },
            timestamp: CURRENT_TIMESTAMP,
            requested_by: 'user'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: CURRENT_TIMESTAMP
        });
    }
};

export const getWallpaperById = async (req: Request, res: Response) => {
    try {
        const wallpaper = scanner.getWallpaperById(req.params.id);
        if (!wallpaper) {
            res.status(404).json({
                error: 'Wallpaper not found',
                timestamp: CURRENT_TIMESTAMP
            });
            return;
        }
        res.json({
            data: wallpaper,
            timestamp: CURRENT_TIMESTAMP,
            requested_by: CURRENT_USER
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: CURRENT_TIMESTAMP
        });
    }
};

// Discovery Features
export const getRandomWallpapers = async (req: Request, res: Response) => {
    try {
        const count = Math.min(parseInt(req.query.count as string) || 1, 10);
        const wallpapers = scanner.getRandomWallpapers(count);
        res.json({
            data: wallpapers,
            timestamp: CURRENT_TIMESTAMP,
            requested_by: CURRENT_USER
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: CURRENT_TIMESTAMP
        });
    }
};

export const searchWallpapers = async (req: Request, res: Response) => {
    try {
        const query = req.query.query as string;
        if (!query) {
            res.status(400).json({
                error: 'Search query is required',
                timestamp: CURRENT_TIMESTAMP
            });
            return;
        }
        const results = scanner.searchWallpapers(query);
        res.json({
            data: results,
            timestamp: CURRENT_TIMESTAMP,
            requested_by: CURRENT_USER
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: CURRENT_TIMESTAMP
        });
    }
};

export const filterWallpapers = async (req: Request, res: Response) => {
    try {
        const filters: any = {};

        if (req.query.tags) filters.tags = (req.query.tags as string).split(',');
        if (req.query.colors) filters.colors = (req.query.colors as string).split(',');
        if (req.query.min_width) filters.min_width = parseInt(req.query.min_width as string);
        if (req.query.max_width) filters.max_width = parseInt(req.query.max_width as string);
        if (req.query.min_height) filters.min_height = parseInt(req.query.min_height as string);
        if (req.query.max_height) filters.max_height = parseInt(req.query.max_height as string);
        if (req.query.format) filters.format = req.query.format as string;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const filteredWallpapers = scanner.filterWallpapers(filters);
        const start = (page - 1) * limit;
        const end = start + limit;

        res.json({
            data: filteredWallpapers.slice(start, end),
            pagination: {
                current_page: page,
                total_pages: Math.ceil(filteredWallpapers.length / limit),
                total_items: filteredWallpapers.length,
                items_per_page: limit
            },
            timestamp: CURRENT_TIMESTAMP,
            requested_by: CURRENT_USER
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: CURRENT_TIMESTAMP
        });
    }
};

// Image Processing
export const getPreview = async (req: Request, res: Response) => {
    try {
        const wallpaper = scanner.getWallpaperById(req.params.id);
        if (!wallpaper) {
            res.status(404).json({
                error: 'Wallpaper not found',
                timestamp: CURRENT_TIMESTAMP
            });
            return;
        }

        res.redirect(wallpaper.preview_url);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: CURRENT_TIMESTAMP
        });
    }
};

export const downloadWallpaper = async (req: Request, res: Response) => {
    try {
        const wallpaper = scanner.getWallpaperById(req.params.id);
        if (!wallpaper) {
            res.status(404).json({
                error: 'Wallpaper not found',
                timestamp: CURRENT_TIMESTAMP
            });
            return;
        }

        // Increment download count
        await scanner.incrementDownloads(req.params.id);

        res.redirect(wallpaper.download_url);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: CURRENT_TIMESTAMP
        });
    }
};

// Statistics
export const getPopularWallpapers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const wallpapers = scanner.getAllWallpapers()
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0));

        const start = (page - 1) * limit;
        const end = start + limit;

        res.json({
            data: wallpapers.slice(start, end),
            pagination: {
                current_page: page,
                total_pages: Math.ceil(wallpapers.length / limit),
                total_items: wallpapers.length,
                items_per_page: limit
            },
            timestamp: CURRENT_TIMESTAMP,
            requested_by: CURRENT_USER
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: CURRENT_TIMESTAMP
        });
    }
};

// Health Check
export const healthCheck = async (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: CURRENT_TIMESTAMP,
        version: '1.0.0',
        service: 'wallzen-api',
        wallpapers_count: scanner.getAllWallpapers().length
    });
};

export const getStatus = async (req: Request, res: Response) => {
    try {
        const wallpapers = scanner.getAllWallpapers();
        res.json({
            timestamp: CURRENT_TIMESTAMP,
            totalWallpapers: wallpapers.length,
            processingStatus: 'active',
            wallpaperDirExists: fs.existsSync(config.wallpaperDir),
            previewDirExists: fs.existsSync(config.previewsDir)
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};