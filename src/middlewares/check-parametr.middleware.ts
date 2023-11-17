import {NextFunction, Request, Response} from "express";
import ApiError from "./api-error.middleware";
import {TokenService} from "../services/tokenService";
import {TokenData} from "../interfaces/tokens.interfaces";
import * as mongoose from "mongoose";

type Params = {optional?: boolean, isRefresh?: boolean}
const defaultParams = { optional: false, isRefresh: false};
export default function checkParameterMiddleware({optional}: Params = defaultParams) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
           if (mongoose.Types.ObjectId.isValid(req.params?.id)){
               return next();
           }
           else {
               res.status(401).send({
                   error: {
                       message: "Id isn't correct"
                   }
               })
           }
        } catch (e) {
            return next(e);
        }
    }
}
