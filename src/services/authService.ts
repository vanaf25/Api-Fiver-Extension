import {TokenService} from "./tokenService";
import {JobModel, UserModel} from '../models/jobSchema';
import * as mongoose from "mongoose";
import ApiError from "../middlewares/api-error.middleware";
import {JobsService} from "./jobsService";

export class AuthService {
    static async register(ip:string) {
        try {
            const user=await UserModel.create({
                ip
            });
            return TokenService.createToken(user._id);
        }
        catch (e){
            console.log('errr')
         return  e
        }
    }
    static async getProfileData(userId){
        const user=await UserModel.findOne({_id:userId});
        if (!user) throw ApiError.NotFound("The user was not founded");

        return user     }
}
