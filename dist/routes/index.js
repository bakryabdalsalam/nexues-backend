"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = require("./user.routes");
const company_routes_1 = require("./company.routes");
const upload_routes_1 = require("./upload.routes");
const job_routes_1 = __importDefault(require("./job.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/user', user_routes_1.userRoutes);
router.use('/company', company_routes_1.companyRoutes);
router.use('/upload', upload_routes_1.uploadRoutes);
router.use('/jobs', job_routes_1.default);
exports.default = router;
