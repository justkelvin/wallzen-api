import * as chokidar from 'chokidar';
import { config } from '../config';
import { WallpaperProcessor } from './wallpaperProcessor';
import { WallpaperFilters } from '../types/wallpaper';
import { DatabaseService } from '../services/database.services';

export class WallpaperScanner {
    private watcher: chokidar.FSWatcher;
    private db: DatabaseService;

    constructor() {
        this.db = new DatabaseService();
        this.watcher = chokidar.watch(config.wallpaperDir, {
            ignored: /(^|[\\/\\])\.../,
            persistent: true
        });

        this.setupWatcher();
    }

    private setupWatcher() {
        this.watcher
            .on('add', async (filePath: string) => {
                const wallpaper = await WallpaperProcessor.processImage(filePath);
                if (wallpaper) {
                    await this.db.createWallpaper({
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
            });
    }

    public async getAllWallpapers(page?: number, limit?: number) {
        return this.db.getAllWallpapers(page, limit);
    }

    public async getWallpaperById(id: string) {
        return this.db.getWallpaperById(id);
    }

    public async searchWallpapers(query: string, page?: number, limit?: number) {
        return this.db.searchWallpapers(query, page, limit);
    }

    public async filterWallpapers(filters: WallpaperFilters, page?: number, limit?: number) {
        return this.db.filterWallpapers(filters, page, limit);
    }

    public async incrementDownloads(id: string) {
        return this.db.incrementDownloads(id);
    }
}