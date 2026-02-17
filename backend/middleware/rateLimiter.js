// Simple in-memory rate limiter (for development)
// For production, use redis-based rate limiter

const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 60000) { // 1 minute window
      requestCounts.delete(key);
    }
  }
}, 300000); // Clean every 5 minutes

export const rateLimiter = (maxRequests = 10, windowMs = 60000) => {
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const key = `chat:${userId}`;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const data = requestCounts.get(key);

    // Reset if window expired
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    // Check if limit exceeded
    if (data.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please wait ${Math.ceil((data.resetTime - now) / 1000)} seconds before trying again.`,
        retryAfter: Math.ceil((data.resetTime - now) / 1000)
      });
    }

    // Increment count
    data.count++;
    next();
  };
};
