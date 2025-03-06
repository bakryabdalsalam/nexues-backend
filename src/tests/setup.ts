import { db } from '../services/database.service';

beforeAll(async () => {
  // Clean up database before tests
  await db.application.deleteMany();
  await db.job.deleteMany();
  await db.profile.deleteMany();
  await db.user.deleteMany();
});

afterAll(async () => {
  await db.$disconnect();
});
