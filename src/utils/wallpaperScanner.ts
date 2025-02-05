import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs-extra';
import { config } from '../config';
import { WallpaperProcessor } from './wallpaperProcessor';
import { Wallpaper } from '../types/wallpaper';

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
            .on('add', async (filePath) => {
                const wallpaper = await WallpaperProcessor.processImage(filePath);
                if (wallpaper) {
                    this.wallpapers.set(wallpaper.public_id, wallpaper);
                    await this.saveData();
                }
            })
            .on('unlink', async (filePath) => {
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
}