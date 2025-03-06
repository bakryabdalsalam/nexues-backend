import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initializeDatabase = async () => {
  // Use string literals instead of enums
  const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];
  const experienceLevels = ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];
  const jobCategories = ['ENGINEERING', 'DESIGN', 'MARKETING', 'SALES', 'CUSTOMER_SERVICE', 'OTHER'];

  try {
    // Create test jobs if none exist
    const jobCount = await prisma.job.count();
    
    if (jobCount === 0) {
      console.log('Seeding initial jobs...');
      
      // First, ensure we have a company user
      const companyUser = await prisma.user.findFirst({
        where: { role: 'COMPANY' }
      });

      if (!companyUser) {
        throw new Error('No company user found. Please run database seed first.');
      }

      await prisma.job.createMany({
        data: [
          {
            title: 'Frontend Developer',
            description: 'React developer needed for a fast-growing startup',
            location: 'Remote',
            salary: 75000,
            employmentType: 'FULL_TIME',
            remote: true,
            experienceLevel: 'MID',
            category: 'ENGINEERING',
            companyId: companyUser.id
          },
          {
            title: 'Backend Developer',
            description: 'Node.js developer needed for our core platform',
            location: 'New York',
            salary: 95000,
            employmentType: 'FULL_TIME',
            remote: false,
            experienceLevel: 'SENIOR',
            category: 'ENGINEERING',
            companyId: companyUser.id
          }
        ]
      });
      console.log('Initial jobs seeded successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};
