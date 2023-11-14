import { TokenService } from "./tokenService";
import { UserModel } from '../models/jobSchema';
import * as mongoose from "mongoose";
import ApiError from "../middlewares/api-error.middleware";
export class AuthService {
    static async register(ip) {
        try {
            //@ts-ignore
            const customId = new mongoose.Types.ObjectId();
            const newUser = new UserModel({
                _id: customId,
                myJobs: [],
                currentJobs: [],
                tokens: [],
                balance: 0,
            });
            const user = await UserModel.create({
                ip
            });
            return TokenService.createToken(user._id);
        }
        catch (e) {
            console.log('errr');
            return e;
        }
    }
    static async getProfileData(userId) {
        const user = await UserModel.findOne({ _id: userId });
        if (!user)
            throw ApiError.NotFound("The user was not founded");
        return user;
    }
}
