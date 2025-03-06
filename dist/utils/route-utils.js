"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuth = void 0;
const withAuth = (handler) => {
    return (req, res, next) => {
        return handler(req, res, next);
    };
};
exports.withAuth = withAuth;
