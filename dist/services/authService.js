"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tokenService_1 = require("./tokenService");
const jobSchema_1 = require("../models/jobSchema");
const mongoose = __importStar(require("mongoose"));
const api_error_middleware_1 = __importDefault(require("../middlewares/api-error.middleware"));
class AuthService {
    static async register(ip) {
        try {
            //@ts-ignore
            const customId = new mongoose.Types.ObjectId();
            const newUser = new jobSchema_1.UserModel({
                _id: customId,
                myJobs: [],
                currentJobs: [],
                tokens: [],
                balance: 0,
            });
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
