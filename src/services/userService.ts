import {HistoryModel, JobModel, UserModel} from '../models/jobSchema';
import ApiError from "../middlewares/api-error.middleware";
import {JobsService} from "./jobsService";
export class UserService {
    static async getProfileData(userId){
        const user=await UserModel.findOne({_id:userId});
        if (!user) throw ApiError.NotFound("The user was not founded");
        const {count}=await this.getMyHistory(userId,1,10)
        const {availableJobs:availableExchanges}=await JobsService.getJobs(1,userId)
        const returnedUser=JSON.parse(JSON.stringify(user))
        return {...returnedUser,exchangesMade:count,availableExchanges}
    }
        static async getUserHistory(userId,currentPage,pageSize=10){
        if (currentPage<1)currentPage=1
        const PAGE_SIZE=pageSize;
            const skip = (currentPage - 1) * PAGE_SIZE;
         const [histories, historyCount] = await Promise.all([
             HistoryModel.find({user:userId}).skip(skip).limit(PAGE_SIZE)
                 .populate({path:"job", populate:{
                         path: 'author',
                         model:"User",
                     }}).exec(),
             HistoryModel.countDocuments({user:userId}),
            ]);
         return {data:histories,count:historyCount}
        }
        static async getMyHistory(userId,currentPage,pageSize=10){
            if (currentPage<1)currentPage=1
            const PAGE_SIZE=pageSize;
            const skip = (currentPage - 1) * PAGE_SIZE;
            console.log('u:',userId);
            let [histories, historyCount] = await Promise.all([
                HistoryModel.
                find({

                })
                    .populate({

                        path:"job",
                        match:{author:userId},
                        options: { limit: 1 },
                        populate:{
                            path: 'author',
                            model:"User",
                        }}).populate("user").exec(),
                HistoryModel.countDocuments({
                    'job':{ $exists: true, $ne: null },
                })
            ]);
            //comment
            console.log('id:',userId)
            //@ts-ignore
            histories=[...histories].filter((history,index)=>{
                // Slice the array to get the elements for the current page
                return history.job && history.user.id!=userId
            });
            const historiesLength=histories.length

            //@ts-ignore
            histories =[...histories].slice(skip, skip + pageSize);
            return {data:histories,count:historiesLength}
        }
        static async getMyJobs(userId:number,page:number){
        const PAGE_SIZE=5;
            const skip = (page - 1) * PAGE_SIZE;
            const user=await UserModel.findOne({_id:userId}).populate("histories").exec();
            const [data, count] = await Promise.all([
                JobModel.find({
                        $and:[{ author:userId},{isDeleted:false}]
                })
                    .skip(skip).limit(PAGE_SIZE),
                JobModel.countDocuments({
                    $and:[{ author:userId},{isDeleted:false}]
                }),
            ]);
                return {data,count}
        }
}
