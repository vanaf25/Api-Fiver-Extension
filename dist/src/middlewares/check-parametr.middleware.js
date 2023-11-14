import ApiError from "./api-error.middleware";
import * as mongoose from "mongoose";
const defaultParams = { optional: false, isRefresh: false };
export default function checkParameterMiddleware({ optional } = defaultParams) {
    return async function (req, res, next) {
        try {
            if (mongoose.Types.ObjectId.isValid(req.params?.id)) {
                return next();
            }
            return next(ApiError.UnauthorizedError("Id is not valid"));
        }
        catch (e) {
            return next(e);
        }
    };
}
