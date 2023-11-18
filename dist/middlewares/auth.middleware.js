"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
                return res.status(401).send({
                    error: {
                        message: "TOKEN_EMPTY"
                    }
                });
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
