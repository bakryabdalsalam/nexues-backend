import { db } from '../services/database.service';
import { EmploymentType, ExperienceLevel, JobCategory } from '@prisma/client';

export async function initializeDatabase() {
  try {
    // Create test jobs if none exist
    const jobCount = await db.job.count();
    
    if (jobCount === 0) {
      console.log('Seeding initial jobs...');
      
      // First, ensure we have a company user
      const companyUser = await db.user.findFirst({
        where: { role: 'COMPANY' }
      });

      if (!companyUser) {
        throw new Error('No company user found. Please run database seed first.');
      }

      await db.job.createMany({
        data: [
          {
            title: 'Frontend Developer',
            description: 'React developer needed for a fast-growing startup',
            location: 'Remote',
            salary: 75000,
            employmentType: EmploymentType.FULL_TIME,
            remote: true,
            experienceLevel: ExperienceLevel.MID_LEVEL,
            category: JobCategory.ENGINEERING,
            companyId: companyUser.id
          },
          {
            title: 'Backend Developer',
            description: 'Node.js developer needed for our core platform',
            location: 'New York',
            salary: 95000,
            employmentType: EmploymentType.FULL_TIME,
            remote: false,
            experienceLevel: ExperienceLevel.SENIOR,
            category: JobCategory.ENGINEERING,
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
}
