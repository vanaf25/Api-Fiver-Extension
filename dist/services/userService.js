"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const jobSchema_1 = require("../models/jobSchema");
const api_error_middleware_1 = __importDefault(require("../middlewares/api-error.middleware"));
class UserService {
    static async getProfileData(userId) {
        const user = await jobSchema_1.UserModel.findOne({ _id: userId }).populate("history").exec();
        if (!user)
            throw api_error_middleware_1.default.NotFound("The user was not founded");
        return user;
    }
    static async getUserHistory(userId, currentPage, pageSize = 10) {
        if (currentPage < 1)
            currentPage = 1;
        const PAGE_SIZE = pageSize;
        const skip = (currentPage - 1) * PAGE_SIZE;
        const [histories, historyCount] = await Promise.all([
            jobSchema_1.HistoryModel.find({ user: userId }).skip(skip).limit(PAGE_SIZE)
                .populate({ path: "job", populate: {
                    path: 'author',
                    model: "User",
                } }).exec(),
            jobSchema_1.HistoryModel.countDocuments({ user: userId }),
        ]);
        return { data: histories, count: historyCount };
    }
    static async getMyHistory(userId, currentPage, pageSize = 10) {
        if (currentPage < 1)
            currentPage = 1;
        const PAGE_SIZE = pageSize;
        const skip = (currentPage - 1) * PAGE_SIZE;
        console.log('u:', userId);
        let [histories, historyCount] = await Promise.all([
            jobSchema_1.HistoryModel.find({})
                .populate({
                path: "job",
                match: { author: userId },
                populate: {
                    path: 'author',
                    model: "User",
                }
            }).exec(),
            jobSchema_1.HistoryModel.countDocuments()
        ]);
        console.log('h:', histories);
        histories.forEach(h => {
            //@ts-ignore
            console.log(h?.job?.author);
        });
        //comment
        //@ts-ignore
        histories = [...histories].filter(history => history.job && history.job?.author._id !== userId);
        return { data: histories, count: histories.length };
    }
    static async getMyJobs(userId, page) {
        const PAGE_SIZE = 5;
        const skip = (page - 1) * PAGE_SIZE;
        const user = await jobSchema_1.UserModel.findOne({ _id: userId }).populate("histories").exec();
        const [data, count] = await Promise.all([
            jobSchema_1.JobModel.find({ author: userId }).skip(skip).limit(PAGE_SIZE),
            jobSchema_1.JobModel.countDocuments({ author: userId }),
        ]);
        return { data, count };
    }
}
exports.UserService = UserService;
