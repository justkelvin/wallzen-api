import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import wallpaperRoutes from './routes/wallpaperRoutes';
import { rateLimitTracker } from './middleware/rateLimitTracker';
import { config } from './config';
import { DatabaseService } from './services/database.services';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const dbService = new DatabaseService();

// Configure CORS to allow requests from frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Add rate limit tracker
app.use(rateLimitTracker);

// Static file serving
app.use('/previews', express.static(config.previewsDir));
app.use('/wallpapers', express.static(config.wallpaperDir));

// API routes
app.use('/api', wallpaperRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        timestamp: new Date().toISOString()
    });
});

// Initialize database connection
async function initializeApp() {
    try {
        await dbService.connect();

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