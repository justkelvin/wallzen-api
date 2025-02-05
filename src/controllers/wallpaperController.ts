import { Request, Response } from 'express';
import { Wallpaper } from '../types/wallpaper';

// Temporary mock data
const wallpapers: Wallpaper[] = [
    {
        public_id: '1',
        name: 'Mountain Landscape',
        width: 3840,
        height: 2160,
        format: 'jpg',
        created_at: '2025-02-04 16:45:28',
        tags: ['nature', 'mountain'],
        colors: ['#2B2B2B', '#FFFFFF'],
        preview_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        download_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
    }
];

export const getWallpapers = async (req: Request, res: Response) => {
    try {
        res.json(wallpapers);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};