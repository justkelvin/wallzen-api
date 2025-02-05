import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wallpaperRoutes from './routes/wallpaperRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', wallpaperRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: '2025-02-04 16:45:28'
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});