"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_service_1 = require("../services/database.service");
beforeAll(async () => {
    // Clean up database before tests
    await database_service_1.db.application.deleteMany();
    await database_service_1.db.job.deleteMany();
    await database_service_1.db.profile.deleteMany();
    await database_service_1.db.user.deleteMany();
});
afterAll(async () => {
    await database_service_1.db.$disconnect();
});
