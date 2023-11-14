import ApiError from "./api-error.middleware";
import { TokenService } from "../services/tokenService";
const defaultParams = { optional: false, isRefresh: false };
export default function authMiddleware({ optional } = defaultParams) {
    return async function (req, res, next) {
        req.body.identity = {};
        try {
            let token = req.headers.authorization;
            if (!token) {
                if (optional) {
                    return next();
                }
                return next(ApiError.UnauthorizedError("TOKEN_EMPTY"));
            }
            let tokenData = TokenService.decodeAccessToken(token);
            await TokenService.compareTokenWithDb(tokenData.payload, token, "access_token");
            req.body.identity = tokenData.payload;
            return next();
        }
        catch (e) {
            return next(e);
        }
    };
}
