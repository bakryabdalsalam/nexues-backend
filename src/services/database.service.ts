import { PrismaClient } from '@prisma/client';

class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  public async connect() {
    try {
      await this.prisma.$connect();
      console.log('Database connected successfully');
      
      // Verify tables exist
      const tableCount = await this.prisma.$queryRaw`
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      console.log('Available tables:', tableCount);
      
    } catch (error) {
      console.error('Database connection error:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const db = DatabaseService.getInstance().getPrisma();

// Initialize database connection
DatabaseService.getInstance().connect().catch(console.error);
