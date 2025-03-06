"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to Nexues API',
        version: '1.0.0'
    });
});
exports.default = router;
