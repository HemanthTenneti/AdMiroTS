import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints.
 * Limits each IP to 5 requests per 15-minute window to prevent brute-force attacks.
 * This strikes a balance between security and legitimate use cases like
 * users mistyping passwords or testing OAuth flows.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting in test environment
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * General API rate limiter for all other endpoints.
 * More generous limits (100 requests per 15 minutes) for normal API operations.
 * Protects against DoS attacks while allowing normal usage patterns.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * Rate limiter for public data endpoints (advertisements listing).
 * Stricter limits (20 requests per minute) to prevent data scraping and abuse.
 * Public endpoints are more vulnerable to automated abuse patterns.
 */
export const publicDataRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});
