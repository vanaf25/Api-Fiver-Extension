"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tokenService_1 = require("./tokenService");
const jobSchema_1 = require("../models/jobSchema");
const api_error_middleware_1 = __importDefault(require("../middlewares/api-error.middleware"));
class AuthService {
    static async register(ip) {
        try {
            const user = await jobSchema_1.UserModel.create({
                ip
            });
            return tokenService_1.TokenService.createToken(user._id);
        }
        catch (e) {
            console.log('errr');
            return e;
        }
    }
    static async getProfileData(userId) {
        const user = await jobSchema_1.UserModel.findOne({ _id: userId });
        if (!user)
            throw api_error_middleware_1.default.NotFound("The user was not founded");
        return user;
    }
}
exports.AuthService = AuthService;
