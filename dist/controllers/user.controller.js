"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
class UserController {
    static async getUserHistory(req, res) {
        const userId = req.body?.identity?.id;
        const { page = 1, take = 10 } = req.query;
        const result = await userService_1.UserService.getUserHistory(userId, page, take);
        res.json(result);
    }
    static async getMyJobs(req, res) {
        const userId = req.body?.identity?.id;
        const { page = 1 } = req.query;
        res.json(await userService_1.UserService.getMyJobs(userId, +page));
    }
    static async getMyHistory(req, res) {
        const userId = req.body?.identity?.id;
        const { page = 1, take = 10 } = req.query;
        const result = await userService_1.UserService.getMyHistory(userId, page, +take);
        res.json(result);
    }
}
exports.UserController = UserController;
