import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import wallpaperRoutes from './routes/wallpaperRoutes';
import { config } from './config';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files
app.use('/wallpapers', express.static(config.wallpaperDir));
app.use('/previews', express.static(config.previewsDir));

app.use('/api', wallpaperRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});