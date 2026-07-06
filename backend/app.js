import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './middlewares/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import swapRouter from './routes/swap.routes.js';
import chatRouter from './routes/chat.routes.js';
import statisticsRouter from './routes/statistics.routes.js';
import { ApiResponse } from './utils/ApiResponse.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from './utils/constants.js';
import { env } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Apply basic middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routing modules
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/swaps', swapRouter);
app.use('/api/chat', chatRouter);
app.use('/api/statistics', statisticsRouter);

// Health check endpoint (scalable and clean)
app.get('/api/health', (req, res) => {
  return ApiResponse.success(res, RESPONSE_MESSAGES.CONNECTION_SUCCESS, {
    status: 'online',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  }, HTTP_STATUS.OK);
});
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillSwap AI Backend is Running 🚀"
  });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    mongodb: "connected",
    time: new Date()
  });
});
// Fallback for unhandled routes
app.use('*', (req, res) => {
  return ApiResponse.error(
    res,
    `${RESPONSE_MESSAGES.RESOURCE_NOT_FOUND}: ${req.originalUrl}`,
    [],
    HTTP_STATUS.NOT_FOUND
  );
});

// Global Error Handler
app.use(errorHandler);

export default app;
