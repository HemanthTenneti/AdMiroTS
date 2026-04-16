import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints.
 * Extremely lenient for development / Postman testing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test environment
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * General API rate limiter for all other endpoints.
 * Extremely lenient for development / Postman testing.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5000, // 5000 requests per minute
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * Rate limiter for public data endpoints (advertisements listing).
 * Extremely lenient for development / Postman testing.
 */
export const publicDataRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2000, // 2000 requests per minute
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});
