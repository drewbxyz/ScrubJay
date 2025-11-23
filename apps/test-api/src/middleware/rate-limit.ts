import express from "express";

// Rate limiting storage
const rateLimits: Record<string, { count: number; resetTime: number }> = {};

export function rateLimit(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const apiKey = req.headers["x-ebirdapitoken"] as string;
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxRequests = 10000; // eBird API limit

  if (!rateLimits[apiKey] || now > rateLimits[apiKey].resetTime) {
    rateLimits[apiKey] = { count: 0, resetTime: now + windowMs };
  }

  if (rateLimits[apiKey].count >= maxRequests) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  rateLimits[apiKey].count++;
  next();
}
