import { UserService } from "../services/userService";
export class UserController {
    static async getUserHistory(req, res) {
        const userId = req.body?.identity?.id;
        const { page = 1, take = 10 } = req.query;
        const result = await UserService.getUserHistory(userId, page, take);
        res.json(result);
    }
    static async getMyJobs(req, res) {
        const userId = req.body?.identity?.id;
        const { page = 1 } = req.query;
        res.json(await UserService.getMyJobs(userId, +page));
    }
}
