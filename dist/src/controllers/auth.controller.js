import { AuthService } from "../services/authService";
export class AuthController {
    static async registration(req, res) {
        console.log('22');
        const { ip } = req.body;
        console.log('ip:', req.body);
        const result = await AuthService.register(ip);
        res.cookie("token2", result.token, { domain: "localhost", sameSite: "none", secure: true, maxAge: 3600 * 24 * 3650 });
        return res.json({ "token": result.token });
    }
    static async getMe(req, res) {
        const userId = req.body.identity?.id;
        const result = await AuthService.getProfileData(userId);
        console.log(result);
        return res.json(result);
    }
}
