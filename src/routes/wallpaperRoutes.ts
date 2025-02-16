import express from 'express';
import {
    getWallpapers,
    getWallpaperById,
    getRandomWallpapers,
    searchWallpapers,
    filterWallpapers,
    downloadWallpaper,
    getPreview,
    getPopularWallpapers,
    healthCheck,
    getStatus
} from '../controllers/wallpaperController';
import { apiLimiter, downloadLimiter } from '../middleware/rateLimitter';

const router = express.Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Server status
router.get('/status', getStatus);

// Health check
router.get('/health', healthCheck);

// Discovery features
router.get('/wallpapers/random', getRandomWallpapers);
router.get('/wallpapers/search', searchWallpapers);
router.get('/wallpapers/filter', filterWallpapers);
router.get('/wallpapers/popular', getPopularWallpapers);

// Core endpoints
router.get('/wallpapers', getWallpapers);
router.get('/wallpapers/:id', getWallpaperById);

// Image processing
router.get('/wallpapers/:id/preview', getPreview);
router.get('/wallpapers/:id/download', downloadLimiter, downloadWallpaper);

export default router;