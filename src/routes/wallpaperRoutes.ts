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
import {
    apiLimiter,
    downloadLimiter,
    searchLimiter,
    healthLimiter
} from '../middleware/rateLimitter';

const router = express.Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Server status
router.get('/status', healthLimiter, getStatus);

// Health check
router.get('/health', healthLimiter, healthCheck);

// Discovery features
router.get('/wallpapers/random', getRandomWallpapers);
router.get('/wallpapers/search', searchLimiter, searchWallpapers);
router.get('/wallpapers/filter', searchLimiter, filterWallpapers);
router.get('/wallpapers/popular', getPopularWallpapers);

// Core endpoints
router.get('/wallpapers', getWallpapers);
router.get('/wallpapers/:id', getWallpaperById);

// Image processing
router.get('/wallpapers/:id/preview', getPreview);
router.get('/wallpapers/:id/download', downloadLimiter, downloadWallpaper);

export default router;