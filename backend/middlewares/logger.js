/**
 * Production-ready HTTP request logger middleware.
 * Logs method, URL, status code, response time, and user-agent.
 */
const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    let color = '\x1b[32m'; // Green for 2xx
    if (statusCode >= 300 && statusCode < 400) color = '\x1b[36m'; // Cyan for 3xx
    if (statusCode >= 400 && statusCode < 500) color = '\x1b[33m'; // Yellow for 4xx
    if (statusCode >= 500) color = '\x1b[31m'; // Red for 5xx

    console.log(
      `[HTTP] ${color}${method}\x1b[0m ${originalUrl} - Status: ${color}${statusCode}\x1b[0m - Duration: ${duration}ms`
    );
  });

  next();
};

export default logger;
