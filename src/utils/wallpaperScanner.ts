import * as chokidar from 'chokidar';
import path from 'path';
import fs from 'fs-extra';
import { config } from '../config';
import { WallpaperProcessor } from './wallpaperProcessor';
import { Wallpaper, WallpaperFilters, SortOptions } from '../types/wallpaper';

export class WallpaperScanner {
    private wallpapers: Map<string, Wallpaper> = new Map();
    private watcher: chokidar.FSWatcher;

    constructor() {
        this.watcher = chokidar.watch(config.wallpaperDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });

        this.setupWatcher();
        this.loadExistingData();
    }

    private async loadExistingData() {
        try {
            if (await fs.pathExists(config.dbPath)) {
                const data = await fs.readJSON(config.dbPath);
                this.wallpapers = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Error loading existing data:', error);
        }
    }

    private setupWatcher() {
        this.watcher
            .on('add', async (filePath: string) => {
                const wallpaper = await WallpaperProcessor.processImage(filePath);
                if (wallpaper) {
                    this.wallpapers.set(wallpaper.public_id, wallpaper);
                    await this.saveData();
                }
            })
            .on('unlink', async (filePath: string) => {
                // Handle file deletion
                // You'll need to implement this
            });
    }

    private async saveData() {
        try {
            const data = Object.fromEntries(this.wallpapers);
            await fs.ensureDir(path.dirname(config.dbPath));
            await fs.writeJSON(config.dbPath, data, { spaces: 2 });
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    public getAllWallpapers(): Wallpaper[] {
        return Array.from(this.wallpapers.values());
    }

    public getWallpaperById(id: string): Wallpaper | null {
        return this.wallpapers.get(id) || null;
    }

    public getRandomWallpapers(count: number = 1): Wallpaper[] {
        const wallpapers = this.getAllWallpapers();
        return this.shuffle(wallpapers).slice(0, count);
    }

    public searchWallpapers(query: string): Wallpaper[] {
        const wallpapers = this.getAllWallpapers();
        const searchTerm = query.toLowerCase();

        return wallpapers.filter(wallpaper =>
            wallpaper.name.toLowerCase().includes(searchTerm) ||
            wallpaper.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    public filterWallpapers(filters: WallpaperFilters): Wallpaper[] {
        return this.getAllWallpapers().filter(wallpaper => {
            if (filters.tags && !filters.tags.some(tag => wallpaper.tags.includes(tag))) return false;
            if (filters.colors && !filters.colors.some(color => wallpaper.colors.includes(color))) return false;
            if (filters.min_width && wallpaper.width < filters.min_width) return false;
            if (filters.max_width && wallpaper.width > filters.max_width) return false;
            if (filters.min_height && wallpaper.height < filters.min_height) return false;
            if (filters.max_height && wallpaper.height > filters.max_height) return false;
            if (filters.format && wallpaper.format !== filters.format) return false;
            return true;
        });
    }

    private shuffle<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    public async incrementDownloads(id: string): Promise<void> {
        const wallpaper = this.wallpapers.get(id);
        if (wallpaper) {
            wallpaper.downloads = (wallpaper.downloads || 0) + 1;
            await this.saveData();
        }
    }
}