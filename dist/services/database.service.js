"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
class DatabaseService {
    constructor() {
        this.prisma = new client_1.PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
            errorFormat: 'pretty',
        });
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    getPrisma() {
        return this.prisma;
    }
    async connect() {
        try {
            await this.prisma.$connect();
            console.log('Database connected successfully');
            // Get table names instead of just count
            const tables = await this.prisma.$queryRaw `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
            console.log('Available tables:', tables);
        }
        catch (error) {
            console.error('Database connection error:', error);
            process.exit(1);
        }
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.db = DatabaseService.getInstance().getPrisma();
// Initialize database connection
DatabaseService.getInstance().connect().catch(console.error);
