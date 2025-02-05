import sharp from 'sharp';
import path from 'path';
// import fs from 'fs-extra';
import * as fs from 'fs-extra';
import { config } from '../config';
import { Wallpaper } from '../types/wallpaper';
import crypto from 'crypto';

export class WallpaperProcessor {
    static async processImage(filePath: string): Promise<Wallpaper | null> {
        try {
            const stats = await fs.stat(filePath);
            const fileName = path.basename(filePath);
            const fileExt = path.extname(filePath).toLowerCase();

            if (!config.supportedFormats.includes(fileExt)) {
                return null;
            }

            const image = sharp(filePath);
            const metadata = await image.metadata();

            // Generate a unique ID based on file content
            const fileBuffer = await fs.readFile(filePath);
            const publicId = crypto
                .createHash('md5')
                .update(fileBuffer)
                .digest('hex');

            // Create preview if it doesn't exist
            const previewName = `${publicId}_preview${fileExt}`;
            const previewPath = path.join(config.previewsDir, previewName);

            if (!await fs.pathExists(previewPath)) {
                await image
                    .resize(400, 225, { fit: 'cover' })
                    .toFile(previewPath);
            }

            // Extract dominant colors (simplified version)
            const { dominant } = await image
                .stats();

            const wallpaper: Wallpaper = {
                public_id: publicId,
                name: path.parse(fileName).name,
                width: metadata.width || 0,
                height: metadata.height || 0,
                format: fileExt.replace('.', ''),
                created_at: stats.birthtime.toISOString(),
                tags: [], // You can implement automatic tagging later
                colors: [`#${dominant.r.toString(16)}${dominant.g.toString(16)}${dominant.b.toString(16)}`],
                preview_url: `http://localhost:3001/previews/${previewName}`,
                download_url: `http://localhost:3001/wallpapers/${fileName}`,
                views: 0,
                downloads: 0,
                favorites: 0,
            };

            return wallpaper;
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
            return null;
        }
    }
}