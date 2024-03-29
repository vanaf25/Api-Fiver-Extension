import {Request, Response} from "express";
import {AuthService} from "../services/authService";
import {UserService} from "../services/userService";
export class AuthController{
     static async registration(req:Request,res:Response){
         console.log('22');
         const ip=req.headers['x-forwarded-for'] ||
             req.socket.remoteAddress ||
             null
         console.log('ip:',ip);
        const result=await AuthService.register(ip || "" as any);
         res.cookie("token2", result.token,
             {domain: "localhost", sameSite: "none", secure: true,maxAge:3600*24*3650})
        return  res.json({"token":result.token})
    }
    static async getMe(req:Request,res:Response){
         const userId=req.body.identity?.id
        const result=await UserService.getProfileData(userId)
        console.log(result);
         return res.json(result)
    }
}