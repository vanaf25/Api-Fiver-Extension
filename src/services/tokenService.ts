import jwt from 'jsonwebtoken';
import { UserModel, TokenModel } from '../models/jobSchema';
import ApiError from "../middlewares/api-error.middleware";
export class TokenService {
    static async createToken(id) {
        const token = jwt.sign({ payload: { id } }, process.env.JWT_ACCESS_SECRET);
        return TokenModel.create({
            user: id,
            token,
        });
    }
    static decodeAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        } catch (e) {
            throw ApiError.UnauthorizedError(process.env.MODE === "DEVELOPMENT" ? `Error verified jwt [access]: ${e.message}` : "TOKEN_NOT_VALID");
        }
    }
    static async compareTokenWithDb(payload, token, field = "access_token") {
        const user = await UserModel.findOne({_id:payload.id});
        if (!user) {
            throw ApiError.UnauthorizedError("TOKEN_NOT_VALID");
        }
        //@ts-ignore
        const tokens = await TokenModel.find({ user: user._id });
        //@ts-ignore
        if (tokens.length === 0 || tokens[0].token !== token) {
            throw ApiError.UnauthorizedError("TOKEN_NOT_VALID");
        }
        return tokens[0];
    }
}