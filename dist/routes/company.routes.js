"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const company_controller_1 = require("../controllers/company.controller");
const auth_middleware_2 = require("../middleware/auth.middleware");
const route_utils_1 = require("../utils/route-utils");
const router = (0, express_1.Router)();
exports.companyRoutes = router;
// Apply authentication and company role check to all routes
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_2.checkRole)(['COMPANY']));
// Use withAuth wrapper for all controller methods
router.get('/stats', (0, route_utils_1.withAuth)(company_controller_1.companyController.getStats));
router.get('/profile', (0, route_utils_1.withAuth)(company_controller_1.companyController.getProfile));
router.put('/profile', (0, route_utils_1.withAuth)(company_controller_1.companyController.updateProfile));
router.get('/jobs', (0, route_utils_1.withAuth)(company_controller_1.companyController.getJobs));
router.post('/jobs', (0, route_utils_1.withAuth)(company_controller_1.companyController.createJob));
router.put('/jobs/:id', (0, route_utils_1.withAuth)(company_controller_1.companyController.updateJob));
router.delete('/jobs/:id', (0, route_utils_1.withAuth)(company_controller_1.companyController.deleteJob));
router.get('/jobs/:id/applications', (0, route_utils_1.withAuth)(company_controller_1.companyController.getJobApplications));
router.patch('/jobs/:jobId/applications/:applicationId', (0, route_utils_1.withAuth)(company_controller_1.companyController.updateApplicationStatus));
