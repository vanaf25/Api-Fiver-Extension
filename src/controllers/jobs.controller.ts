import {Request, Response} from "express";
import {JobsService} from "../services/jobsService";
import ApiError from "../middlewares/api-error.middleware";

export class JobsController{
static async getJobs(req:Request,res:Response<any,any>,next){
    try {
        const {page=1}=req.query;
        const userId=req.body.identity.id;
        const jobs=await JobsService.getJobs(+page,userId);
        return    res.json(jobs);
    }
    catch (error){
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
static async postJobs(req:Request<any,any,any>,res:Response,next){
    try {
        const body=req.body;
        const userId=req.body.identity.id;
        const result= await JobsService.createJob(body,userId);
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
static async deleteJob(req:Request,res:Response,next){
    try {
       const id=req?.params?.id;
        const userId=req.body.identity.id;
        const result=await JobsService.deleteJob(id,userId)
        res.json(result);
    }
    catch (error){
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ error: { message: error.message } });
        } else {
            next(error);
        }
    }
}
static async applyForJob(req:Request<any,any,any>,res:Response,next){
    try {
        const id=req?.params?.id
        const userId=req.body.identity.id;
        const result= await JobsService.applyForJob(id,userId);
        res.json({result});
    }
    catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ error: { message: error.message } });
        } else {
            next(error);
        }
    }

}
static async getCurrentJob(req,res){
    const {id}=req.params
    const job= await JobsService.getCurrentJob(id)
    res.json(job);
}
static async getCurrentJobs(req:Request<any,any,any>,res:Response){
        const userId=req.body?.identity?.id
        const {page=1}=req.query
        const jobs=await JobsService.getCurrentJobs(userId,page)
        res.json(jobs);
    }
    static async updateCurrentJobs(req:Request,res:Response){
        const userId=req.body?.identity?.id;
        const jobId=req.params.id
        const body=req.body;
        const result=await JobsService.updateCurrentJob(jobId,userId,body);
      return   res.json(result)
    }
    static async exchangeJobs(req:Request,res:Response,next){
    try {
        const userId=req.body?.identity?.id;
        const jobId=req.params.id
        const result=await JobsService.exchangeJobs(jobId,userId);
        return  res.json(result);
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
    static async applyForExchange(req:Request,res:Response,next){
    try {
        const userId=req.body?.identity?.id;
        const exchangeId=req.params.id
        const jobId=req.body.jobId
        const result=await JobsService.applyForExchange(exchangeId,jobId,userId);
        return  res.json(result);
    }
    catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ error: { message: error.message } });
        } else {
            next(error);
        }
    }

    }
    static async getExchanges(req:Request,res:Response){
        const userId=req.body?.identity?.id;
        const result=await JobsService.getExchanges(userId);
        res.json(result);
    }
    static async getCurrentJobByUrl(req:Request,res:Response){
    const {id}=req.params
        return await JobsService.getCurrentJobByUrl(id)
    }
    static async apply(req:Request,res:Response,next){
        try {
            console.log('apply!!!');
            const userId=req.body.identity.id;
            const result= await JobsService.apply(userId);
         return    res.json(result);
        }
        catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ error: { message: error.message } });
            } else {
                next(error);
            }
        }
    }
}