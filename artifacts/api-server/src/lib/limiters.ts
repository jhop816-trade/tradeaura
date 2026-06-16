import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many AI requests — please wait before trying again." },
});
