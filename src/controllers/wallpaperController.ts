import { Request, Response } from 'express';
import { WallpaperScanner } from '../utils/wallpaperScanner';

const scanner = new WallpaperScanner();

export const getWallpapers = async (req: Request, res: Response) => {
    try {
        const wallpapers = scanner.getAllWallpapers();
        res.json(wallpapers);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};