const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

// ─── Validate required environment variables on startup ───
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('   Create a .env file from .env.example and fill in the values.');
  process.exit(1);
}

const userRoutes = require('./routers/userRoutes');
const adminRoutes = require('./routers/adminRoutes');

const app = express();

// Trust proxy for production (needed for rate limiting behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Auth route specific rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login/register requests per 15 minutes
  message: { message: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// CORS configuration
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = process.env.FRONTEND_URL || '';
    return frontendUrl.split(',').map((url) => url.trim()).filter(Boolean);
  }
  return ['http://localhost:5172', 'http://localhost:5173', 'http://localhost:3000'];
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ 
    status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded', 
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: mongoState[mongoose.connection.readyState] || 'unknown',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to LearnHub API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation error', errors: messages });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// MongoDB Connection with production options
const mongoOptions = {
  maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// MongoDB connection event handlers
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose
  .connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated.');
        mongoose.connection.close(false, () => {
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = app;
