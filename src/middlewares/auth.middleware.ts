import {NextFunction, Request, Response} from "express";
import ApiError from "./api-error.middleware";
import {TokenService} from "../services/tokenService";
import {TokenData} from "../interfaces/tokens.interfaces";

type Params = {optional?: boolean, isRefresh?: boolean}
const defaultParams = { optional: false, isRefresh: false};
export default function authMiddleware({optional}: Params = defaultParams) {
    return async function (req: Request, res: Response, next: NextFunction) {
        req.body.identity = {};
        try {
            let token =req.headers.authorization;
            if (!token) {
                if (optional) {
                    return next();
                }
                return    res.status(401).send({
                    error: {
                        message: "TOKEN_EMPTY"
                    }
                });
            }
            let tokenData : any = TokenService.decodeAccessToken(token);
            await TokenService.compareTokenWithDb(tokenData.payload, token,"access_token");
            req.body.identity = tokenData.payload;
            return next();
        } catch (e) {
            return next(e);
        }
    }
}
