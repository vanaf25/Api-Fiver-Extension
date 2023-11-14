"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_error_middleware_1 = __importDefault(require("./api-error.middleware"));
const tokenService_1 = require("../services/tokenService");
const defaultParams = { optional: false, isRefresh: false };
function authMiddleware({ optional } = defaultParams) {
    return async function (req, res, next) {
        req.body.identity = {};
        try {
            let token = req.headers.authorization;
            if (!token) {
                if (optional) {
                    return next();
                }
                return next(api_error_middleware_1.default.UnauthorizedError("TOKEN_EMPTY"));
            }
            let tokenData = tokenService_1.TokenService.decodeAccessToken(token);
            await tokenService_1.TokenService.compareTokenWithDb(tokenData.payload, token, "access_token");
            req.body.identity = tokenData.payload;
            return next();
        }
        catch (e) {
            return next(e);
        }
    };
}
exports.default = authMiddleware;
