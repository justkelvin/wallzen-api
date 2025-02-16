import fs from 'fs-extra';
import { config } from '../config';
import { DatabaseService } from '../services/database.services';

interface WallpaperData {
    public_id: string;
    name: string;
    width: number;
    height: number;
    format: string;
    preview_url: string;
    download_url: string;
    tags: string[];
    colors: string[];
}

async function migrateData() {
    const db = new DatabaseService();
    const data = await fs.readJSON(config.dbPath) as Record<string, WallpaperData>;

    for (const [_, wallpaper] of Object.entries(data)) {
        await db.createWallpaper({
            publicId: wallpaper.public_id,
            name: wallpaper.name,
            width: wallpaper.width,
            height: wallpaper.height,
            format: wallpaper.format,
            previewUrl: wallpaper.preview_url,
            downloadUrl: wallpaper.download_url,
            tags: wallpaper.tags,
            colors: wallpaper.colors
        });
    }
}
migrateData().catch(console.error);