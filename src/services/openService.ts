import {NotificationModel} from "../models/jobSchema";
import ApiError from "../middlewares/api-error.middleware";

export class OpenService {
   static async createNotification(date,link){
     return   await NotificationModel.create({
           date,link
       })
   }
   static async getNotification(date){
       const notification= await NotificationModel.findOne({date});
       if (!notification)    throw ApiError.NotFound("The job was not found");
            return notification
   }
}
