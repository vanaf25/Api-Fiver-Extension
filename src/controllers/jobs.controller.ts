import {Request, Response} from "express";
import {JobsService} from "../services/jobsService";

export class JobsController{
static async getJobs(req:Request,res:Response<any,any>){
    const {page=1}=req.query;
    const jobs=await JobsService.getJobs(+page);
 return    res.json(jobs);
}
static async postJobs(req:Request<any,any,any>,res:Response){
    const body=req.body;
    const userId=req.body.identity.id;
    const result= await JobsService.createJob(body,userId);
  return   res.json({result});
}
static async applyForJob(req:Request<any,any,any>,res:Response){
    const id=req?.params?.id
    const userId=req.body.identity.id;
    console.log(userId)
    console.log(req.body);

    const result= await JobsService.applyForJob(id,userId);
   /* const currentJob=await prisma.currentJob.findUnique({
        where:{id:result.id},
        include:{job:true}
    });*/
    res.json({result});
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
        console.log('body:',req.body)
        const result=await JobsService.updateCurrentJob(jobId,userId,body);
      return   res.json(result)
    }
    static async exchangeJobs(req:Request,res:Response){
        const userId=req.body?.identity?.id;
        const jobId=req.params.id
        const result=await JobsService.exchangeJobs(jobId,userId)
        return  res.json(result);
    }
    static async applyForExchange(req:Request,res:Response){
        const userId=req.body?.identity?.id;
        const exchangeId=req.params.id
        const jobId=req.body.jobId
        const result=await JobsService.applyForExchange(exchangeId,jobId,userId);
        return  res.json(result);
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
}