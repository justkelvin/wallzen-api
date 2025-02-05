import { Request, Response } from 'express';
import { WallpaperScanner } from '../utils/wallpaperScanner';
import { config } from '../config';

const scanner = new WallpaperScanner();

export const getWallpapers = async (req: Request, res: Response) => {
    try {
        const wallpapers = scanner.getAllWallpapers();
        res.json(wallpapers);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
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