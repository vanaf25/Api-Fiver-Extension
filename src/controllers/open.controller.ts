import {Request, Response} from "express";
import {JobsService} from "../services/jobsService";
import ApiError from "../middlewares/api-error.middleware";
import {OpenService} from "../services/openService";
export class OpenController{
static async create(req,res,next){
    try {
        const body=req.body;
        const result= await OpenService.createNotification(body.date,body.link);
        return   res.json({result});
    }
    catch (error) {
        // Перевірка, чи об'єкт помилки є екземпляром ApiError
        if (error instanceof ApiError) {
            // Повертаємо відповідь клієнту з використанням властивостей з вашого класу ApiError
            console.log('err:',error.statusCode);
            res.status(error.statusCode).json({ error: { message: error.message } });
        } else {
            // Інші неочікувані помилки обробляються власним способом
            next(error);
        }
    }
}
static async getNotification(req,res,next){
    try {
        const date=req?.params?.date
        const result= await OpenService.getNotification(date);
        return   res.json({result});
    }
    catch (error) {
        if (error instanceof ApiError) {
            console.log('err:',error.statusCode);
            res.status(error.statusCode).json({ error: { message: error.message } });
        } else {
            next(error);
        }
    }
}
}