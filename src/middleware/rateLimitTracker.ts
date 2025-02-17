import { Request, Response, NextFunction } from 'express';

export const rateLimitTracker = (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body) {
        // Log rate limit information
        const remaining = res.getHeader('RateLimit-Remaining');
        const limit = res.getHeader('RateLimit-Limit');
        const reset = res.getHeader('RateLimit-Reset');

        console.log(`Rate limit status for ${req.ip}:`, {
            endpoint: req.originalUrl,
            remaining,
            limit,
            resetAt: new Date(Number(reset) * 1000).toISOString()
        });

        return originalSend.call(this, body);
    };

    next();
};