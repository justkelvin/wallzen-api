import rateLimit from 'express-rate-limit';

export const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 downloads per windowMs
    message: {
        error: 'Too many download requests, please try again later',
        timestamp: new Date().toISOString()
    }
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many API requests, please try again later',
        timestamp: new Date().toISOString()
    }
});