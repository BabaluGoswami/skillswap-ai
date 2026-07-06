import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './services/socket.js';

// Bootstrapping server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const server = http.createServer(app);
    
    // Initialize Socket.io and attach to server
    const io = initSocket(server);
    app.set('io', io);
    
    // Start listening
    server.listen(env.PORT, () => {
      console.log(`🚀 SkillSwap AI Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error(`Fatal server error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
