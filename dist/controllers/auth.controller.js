"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const userService_1 = require("../services/userService");
class AuthController {
    static async registration(req, res) {
        console.log('22');
        /*const {ip}=req.body;
        console.log('ip:',req.body);*/
        const ip = req.headers['x-forwarded-for'] ||
            req.socket.remoteAddress ||
            null;
        const result = await authService_1.AuthService.register(ip || "");
        res.cookie("token2", result.token, { domain: "localhost", sameSite: "none", secure: true, maxAge: 3600 * 24 * 3650 });
        return res.json({ "token": result.token });
    }
    static async getMe(req, res) {
        const userId = req.body.identity?.id;
        const result = await userService_1.UserService.getProfileData(userId);
        console.log(result);
        return res.json(result);
    }
}
exports.AuthController = AuthController;
