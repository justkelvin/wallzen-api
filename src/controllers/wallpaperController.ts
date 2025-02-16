import { Request, Response } from 'express';
import { WallpaperScanner } from '../utils/wallpaperScanner';
import { config } from '../config';
import fs from 'fs-extra';

const scanner = new WallpaperScanner();

export const getWallpapers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await scanner.getAllWallpapers(page, limit);

        res.json({
            data: result.data,
            pagination: result.pagination,
            timestamp: new Date().toISOString(),
            requested_by: 'user'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const getWallpaperById = async (req: Request, res: Response) => {
    try {
        const wallpaper = await scanner.getWallpaperById(req.params.id);
        if (!wallpaper) {
            res.status(404).json({
                error: 'Wallpaper not found',
                timestamp: new Date().toISOString()
            });
            return;
        }
        res.json({
            data: wallpaper,
            timestamp: new Date().toISOString(),
            requested_by: 'user'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const getRandomWallpapers = async (req: Request, res: Response) => {
    try {
        const count = Math.min(parseInt(req.query.count as string) || 1, 10);
        const page = 1;
        const limit = count;

        const result = await scanner.getAllWallpapers(page, limit);
        // Randomize the results
        const randomizedData = result.data.sort(() => Math.random() - 0.5);

        res.json({
            data: randomizedData,
            timestamp: new Date().toISOString(),
            requested_by: 'user'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const searchWallpapers = async (req: Request, res: Response) => {
    try {
        const query = req.query.query as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!query) {
            res.status(400).json({
                error: 'Search query is required',
                timestamp: new Date().toISOString()
            });
            return;
        }

        const result = await scanner.searchWallpapers(query, page, limit);

        res.json({
            data: result.data,
            pagination: result.pagination,
            timestamp: new Date().toISOString(),
            requested_by: 'user'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const filterWallpapers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const filters = {
            tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
            colors: req.query.colors ? (req.query.colors as string).split(',') : undefined,
            min_width: req.query.min_width ? parseInt(req.query.min_width as string) : undefined,
            max_width: req.query.max_width ? parseInt(req.query.max_width as string) : undefined,
            min_height: req.query.min_height ? parseInt(req.query.min_height as string) : undefined,
            max_height: req.query.max_height ? parseInt(req.query.max_height as string) : undefined,
            format: req.query.format as string | undefined
        };

        const result = await scanner.filterWallpapers(filters, page, limit);

        res.json({
            data: result.data,
            pagination: result.pagination,
            timestamp: new Date().toISOString(),
            requested_by: 'user'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const getPreview = async (req: Request, res: Response) => {
    try {
        const wallpaper = await scanner.getWallpaperById(req.params.id);
        if (!wallpaper) {
            res.status(404).json({
                error: 'Wallpaper not found',
                timestamp: new Date().toISOString()
            });
            return;
        }

        res.redirect(wallpaper.previewUrl);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const downloadWallpaper = async (req: Request, res: Response) => {
    try {
        const wallpaper = await scanner.getWallpaperById(req.params.id);
        if (!wallpaper) {
            res.status(404).json({
                error: 'Wallpaper not found',
                timestamp: new Date().toISOString()
            });
            return;
        }

        await scanner.incrementDownloads(req.params.id);
        res.redirect(wallpaper.downloadUrl);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const getPopularWallpapers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await scanner.getAllWallpapers(page, limit);
        interface Wallpaper {
            downloads?: number;
        }

        const sortedData = result.data.sort((a: Wallpaper, b: Wallpaper) => (b.downloads || 0) - (a.downloads || 0));

        res.json({
            data: sortedData,
            pagination: result.pagination,
            timestamp: new Date().toISOString(),
            requested_by: 'user'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const healthCheck = async (_req: Request, res: Response) => {
    try {
        const result = await scanner.getAllWallpapers(1, 1);
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            service: 'wallzen-api',
            wallpapers_count: result.pagination.totalItems
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

export const getStatus = async (_req: Request, res: Response) => {
    try {
        const result = await scanner.getAllWallpapers(1, 1);
        res.json({
            timestamp: new Date().toISOString(),
            totalWallpapers: result.pagination.totalItems,
            processingStatus: 'active',
            wallpaperDirExists: fs.existsSync(config.wallpaperDir),
            previewDirExists: fs.existsSync(config.previewsDir)
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};