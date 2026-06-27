const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || "Internal Server Error";

  // Only log to terminal in development — no noise in production
  if (process.env.NODE_ENV === "development") {
    console.error(`\n[Error] ${req.method} ${req.originalUrl} → ${statusCode}`);
    console.error(`  Reason: ${message}`);
    if (err.stack) console.error(err.stack);
  } else {
    console.error(`[Error] ${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
