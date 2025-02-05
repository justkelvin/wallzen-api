import path from 'path';

export const config = {
    wallpaperDir: path.join(__dirname, '../../wallpapers'),
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    previewsDir: path.join(__dirname, '../../public/previews'),
    dbPath: path.join(__dirname, '../data/wallpapers.json'),
}