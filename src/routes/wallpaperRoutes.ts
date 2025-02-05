import express from 'express';
import { getWallpapers } from '../controllers/wallpaperController';

const router = express.Router();

router.get('/wallpapers', getWallpapers);

export default router;