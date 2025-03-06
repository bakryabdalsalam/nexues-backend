"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_service_1 = require("./services/database.service");
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const application_routes_1 = require("./routes/application.routes");
const admin_routes_1 = require("./routes/admin.routes");
const upload_routes_1 = require("./routes/upload.routes");
const company_routes_1 = require("./routes/company.routes");
const user_routes_1 = require("./routes/user.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const index_routes_1 = __importDefault(require("./routes/index.routes"));
exports.app = (0, express_1.default)();
// Security middleware
exports.app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
// CORS setup with proper options for cookies
// Support multiple origins for development and production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost:5173', // Vite default
    process.env.FRONTEND_URL,
].filter(Boolean);
exports.app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware
exports.app.use((0, morgan_1.default)('dev'));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
// Rate limiting
if (process.env.NODE_ENV === 'production') {
    exports.app.set('trust proxy', 1);
}
// Health check endpoint
exports.app.get('/health', async (req, res) => {
    try {
        await database_service_1.db.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
        });
    }
});
// API Routes with proper prefixing
const apiRouter = express_1.default.Router();
exports.app.use('/api', apiRouter);
// API welcome message handler
const apiWelcomeHandler = (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to the Job Board API',
        documentation: '/api-docs',
        version: '1.0.0'
    });
};
// Add welcome message for root API endpoint
apiRouter.get('/', apiWelcomeHandler);
// Mount all routes
apiRouter.use('/jobs', job_routes_1.default);
apiRouter.use('/auth', auth_routes_1.default);
apiRouter.use('/company', company_routes_1.companyRoutes);
apiRouter.use('/applications', application_routes_1.applicationRoutes);
apiRouter.use('/admin', admin_routes_1.adminRoutes);
apiRouter.use('/upload', upload_routes_1.uploadRoutes);
apiRouter.use('/user', user_routes_1.userRoutes); // Changed from /users to /user
// Add this before other route handlers
exports.app.use('/', index_routes_1.default);
// Add explicit error handling for CORS errors
exports.app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        console.error('CORS error:', { origin: req.headers.origin });
        return res.status(403).json({
            success: false,
            message: 'CORS error: Origin not allowed'
        });
    }
    next(err);
});
// Error handling middleware should be after routes
exports.app.use(error_middleware_1.errorHandler);
// 404 handler
exports.app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});
