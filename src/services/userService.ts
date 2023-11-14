import {HistoryModel, JobModel, UserModel} from '../models/jobSchema';
import ApiError from "../middlewares/api-error.middleware";
export class UserService {
    static async getProfileData(userId){
        const user=await UserModel.findOne({_id:userId}).populate("history").exec();
        if (!user) throw ApiError.NotFound("The user was not founded");
        return user     }
        static async getUserHistory(userId,currentPage,pageSize=10){
        if (currentPage<1)currentPage=1
        const PAGE_SIZE=pageSize;
            const skip = (currentPage - 1) * PAGE_SIZE;
         const [histories, historyCount] = await Promise.all([
             HistoryModel.find({user:userId}).skip(skip).limit(PAGE_SIZE)
                 .populate({path:"job",populate:{
                         path: 'author',
                         model:"User"
                     }}).exec(),
             HistoryModel.countDocuments({user:userId}),
            ]);
          const  u= histories.map(history=>({...history.toObject(),
              completedAt:new Date(history.completedAt).toLocaleString()}))
         return {data:u,count:historyCount}
        }
        static async getMyJobs(userId:number,page:number){
        const PAGE_SIZE=5;
            const skip = (page - 1) * PAGE_SIZE;
            const user=await UserModel.findOne({_id:userId}).populate("histories").exec();
            const [data, count] = await Promise.all([
                JobModel.find({author: userId}).skip(skip).limit(PAGE_SIZE),
                JobModel.countDocuments({author:userId}),
            ]);
                return {data,count}
        }
}
