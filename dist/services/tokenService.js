"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jobSchema_1 = require("../models/jobSchema");
const api_error_middleware_1 = __importDefault(require("../middlewares/api-error.middleware"));
class TokenService {
    static async createToken(id) {
        const token = jsonwebtoken_1.default.sign({ payload: { id } }, process.env.JWT_ACCESS_SECRET);
        return jobSchema_1.TokenModel.create({
            user: id,
            token,
        });
    }
    static decodeAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        }
        catch (e) {
            throw api_error_middleware_1.default.UnauthorizedError(process.env.MODE === "DEVELOPMENT" ? `Error verified jwt [access]: ${e.message}` : "TOKEN_NOT_VALID");
        }
    }
    static async compareTokenWithDb(payload, token, field = "access_token") {
        const user = await jobSchema_1.UserModel.findOne({ _id: payload.id });
        if (!user) {
            throw api_error_middleware_1.default.UnauthorizedError("TOKEN_NOT_VALID");
        }
        //@ts-ignore
        const tokens = await jobSchema_1.TokenModel.find({ user: user._id });
        //@ts-ignore
        if (tokens.length === 0 || tokens[0].token !== token) {
            throw api_error_middleware_1.default.UnauthorizedError("TOKEN_NOT_VALID");
        }
        return tokens[0];
    }
}
exports.TokenService = TokenService;
