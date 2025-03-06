import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanDatabase() {
  const tableNames = ['Application', 'Job', 'Company', 'Profile', 'User'];
  
  for (const tableName of tableNames) {
    try {
      console.log(`Attempting to clean ${tableName} table...`);
      // @ts-ignore
      await prisma[tableName.toLowerCase()].deleteMany({});
      console.log(`Successfully cleaned ${tableName} table`);
    } catch (error) {
      console.log(`Note: ${tableName} table might not exist yet`);
    }
  }
}

async function main() {
  try {
    // Clean up existing data
    await cleanDatabase();

    console.log('Creating admin user...');
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: UserRole.ADMIN
      }
    });

    console.log('Creating company user...');
    // Create company user
    const companyUser = await prisma.user.create({
      data: {
        email: 'company@example.com',
        password: await bcrypt.hash('company123', 10),
        name: 'Tech Corp',
        role: UserRole.COMPANY,
        company: {
          create: {
            companyName: 'Tech Corporation',
            description: 'Leading technology company',
            industry: 'TECHNOLOGY',
            size: '51-200',
            location: 'San Francisco, CA',
            website: 'https://techcorp.example.com',
            logo: 'https://via.placeholder.com/150'
          }
        }
      },
      include: {
        company: true
      }
    });

    console.log('Creating regular user...');
    // Create regular user
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'John Doe',
        role: UserRole.USER,
        profile: {
          create: {
            fullName: 'John Doe',
            bio: 'Software Developer with 5 years of experience',
            phoneNumber: '+1234567890',
            address: 'New York, NY',
            skills: ['JavaScript', 'React', 'Node.js'],
            experience: '5 years in software development',
            education: 'BS in Computer Science',
            linkedIn: 'https://linkedin.com/in/johndoe',
            github: 'https://github.com/johndoe'
          }
        }
      }
    });

    if (companyUser.company) {
      console.log('Creating sample job...');
      // Create sample job
      const job = await prisma.job.create({
        data: {
          title: 'Senior Software Engineer',
          description: 'Looking for an experienced software engineer to join our team',
          location: 'San Francisco, CA',
          salary: 120000,
          employmentType: 'FULL_TIME',
          experienceLevel: 'SENIOR',
          remote: true,
          requirements: [
            'Bachelor\'s degree in Computer Science or related field',
            '5+ years of experience in software development',
            'Strong knowledge of JavaScript/TypeScript',
            'Experience with React and Node.js'
          ],
          benefits: [
            'Competitive salary',
            'Health insurance',
            'Remote work options',
            '401(k) matching'
          ],
          category: 'ENGINEERING',
          status: 'OPEN',
          companyId: companyUser.company.id
        }
      });

      console.log('Creating sample application...');
      // Create a sample application
      await prisma.application.create({
        data: {
          userId: regularUser.id,
          jobId: job.id,
          status: 'PENDING',
          message: 'I am very interested in this position',
          resume: 'https://example.com/resume.pdf'
        }
      });
    }

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error in seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
