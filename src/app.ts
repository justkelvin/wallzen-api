import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import wallpaperRoutes from './routes/wallpaperRoutes';
import { config } from './config';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS to allow requests from frontend
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Ensure directories exist
app.use('/previews', (req, res, next) => {
    console.log('Preview request:', req.url); // Add logging
    next();
}, express.static(config.previewsDir));

app.use('/wallpapers', (req, res, next) => {
    console.log('Wallpaper request:', req.url); // Add logging
    next();
}, express.static(config.wallpaperDir));

app.use('/api', wallpaperRoutes);

// Add error handling
app.use((req, res) => {
    console.log('404 for:', req.url);
    res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Preview directory: ${config.previewsDir}`);
    console.log(`Wallpaper directory: ${config.wallpaperDir}`);
});