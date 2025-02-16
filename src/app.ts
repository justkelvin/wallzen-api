import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import wallpaperRoutes from './routes/wallpaperRoutes';
import { config } from './config';
import { DatabaseService } from './services/database.services';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const dbService = new DatabaseService();

// Configure CORS to allow requests from frontend
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Initialize database connection
async function initializeApp() {
    try {
        await dbService.connect();

        // Ensure directories exist
        app.use('/previews', (req, res, next) => {
            console.log('Preview request:', req.url);
            next();
        }, express.static(config.previewsDir));

        app.use('/wallpapers', (req, res, next) => {
            console.log('Wallpaper request:', req.url);
            next();
        }, express.static(config.wallpaperDir));

        app.use('/api', wallpaperRoutes);

        // Add error handling
        app.use((req, res) => {
            console.log('404 for:', req.url);
            res.status(404).json({ error: 'Not found' });
        });

        // Start server after database connection is established
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log(`Preview directory: ${config.previewsDir}`);
            console.log(`Wallpaper directory: ${config.wallpaperDir}`);
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await dbService.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

initializeApp();