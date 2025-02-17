import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Custom error response
const createLimitErrorResponse = (retryAfter: number) => ({
    error: 'Rate limit exceeded',
    message: 'Too many requests, please try again later',
    retryAfter,
    timestamp: new Date().toISOString()
});

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: (_req: Request, res: Response) => {
        const retryAfter = parseInt(res.getHeader('Retry-After') as string) || 900; // 15 minutes in seconds
        return createLimitErrorResponse(retryAfter);
    },
    keyGenerator: (req: Request): string => {
        // Use X-Forwarded-For header if behind a proxy, otherwise use IP
        const forwardedFor = req.headers['x-forwarded-for'];
        const ip = req.ip || '0.0.0.0'; // Provide a fallback IP
        return (typeof forwardedFor === 'string' ? forwardedFor : ip);
    }
});

// Download rate limiter - 30 downloads per 15 minutes
export const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 downloads per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: (_req: Request, res: Response) => {
        const retryAfter = parseInt(res.getHeader('Retry-After') as string) || 900;
        return createLimitErrorResponse(retryAfter);
    },
    keyGenerator: (req: Request): string => {
        const forwardedFor = req.headers['x-forwarded-for'];
        const ip = req.ip || '0.0.0.0'; // Provide a fallback IP
        return (typeof forwardedFor === 'string' ? forwardedFor : ip);
    },
    skipFailedRequests: true // Don't count failed requests against the limit
});

// Search rate limiter - 50 searches per 15 minutes
export const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: (_req: Request, res: Response) => {
        const retryAfter = parseInt(res.getHeader('Retry-After') as string) || 900;
        return createLimitErrorResponse(retryAfter);
    },
    keyGenerator: (req: Request): string => {
        const forwardedFor = req.headers['x-forwarded-for'];
        const ip = req.ip || '0.0.0.0'; // Provide a fallback IP
        return (typeof forwardedFor === 'string' ? forwardedFor : ip);
    }
});

// Health check limiter - 10 requests per minute
export const healthLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: (_req: Request, res: Response) => {
        const retryAfter = parseInt(res.getHeader('Retry-After') as string) || 60;
        return createLimitErrorResponse(retryAfter);
    }
});