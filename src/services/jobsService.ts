import {UserModel, JobModel, CurrentJobModel, HistoryModel, ExchangeModel} from "../models/jobSchema"; // Import your Mongoose models
import ApiError from "../middlewares/api-error.middleware";
import { StepInterface } from "../interfaces/jobs.interfaces";
import * as mongoose from "mongoose";
import {scrapper} from "../utils/scrapper";
export class JobsService {
    static async createJob(body, userId) {
     const response=  await scrapper.getGigData(
body.url
     );
        let url = new URL(body.url);
        url.search = "";
        const updatedUrl = url.toString();
        body = { ...body, integrity: undefined,category:response.gigCategory,
            gigId:response.gigId,subCategory:response.gigSubCategory,
            categoryUrl:response.gigCategoryUrl,gigAuthor:response.gigAuthor,url:updatedUrl};
        try {
            const author = await UserModel.findById(userId);
            if (!author) {
                throw ApiError.UnauthorizedError("The author was not found");
            }
            const newJob = new JobModel({
                author: userId,
                favorite: false,
                allImages: false,
                allPackages: false,
                clickProfileLink: false,
                ...body,
                price: 100,
            });

            return newJob.save();
        } catch (e) {
            return e;
        }
    }

    static async getJobs(page) {
        const pageSize = 5;
        const skip = (page - 1) * pageSize;

        const [jobs, jobCount] = await Promise.all([
            JobModel.find({}).skip(skip).limit(pageSize).populate("currentJob").exec(),
            JobModel.countDocuments({}),
        ]);

        return { data: jobs, count: jobCount };
    }
    static async getJobsByUserId(userId){
        return await JobModel.find({author:userId});
    }
    static async applyForJob(jobId, userId,isExchange?:boolean) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return {};
/*
          return   throw ApiError.defaultError("Invalid jobId");
*/
        }
        const job = await JobModel.findOne({ _id: jobId })
            .populate('currentJob')
            .exec();
       job.currentJob.forEach((job)=>{
                   if (job===userId) return  ApiError.UnauthorizedError("Recently You applied for this job")
        })
        if (!job) {
            throw ApiError.NotFound("Job not found");
        }
        const currentJob = new CurrentJobModel({
            job: jobId,
            user: userId,
            isExchange:isExchange || false
        });

        const c= await CurrentJobModel.create({
        job:jobId,
            user:userId,
            isExchange:isExchange || false
        });
        const job2=await JobModel.findOne({_id:jobId});
        job2.currentJob.push(c._id);
      await  job2.save();
      return c
    }
    static async getCurrentJobs(userId, page) {
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const [jobs, jobCount] = await Promise.all([
            CurrentJobModel.find({
                user: userId,
            })
                .skip(skip)
                .limit(pageSize)
                .populate('job')
                .exec(),
            CurrentJobModel.countDocuments({ user: userId }),
        ]);

        return { data: jobs, count: jobCount };
    }

    static async updateCurrentJob(jobId, userId, steps:any) {
        console.log('steps:',steps);
        const currentJob:any = await CurrentJobModel.findOne({ _id: jobId }).populate('job')
            .exec();
        console.log('currentJob:',currentJob);
        if (!currentJob) {
           return   ApiError.NotFound("Current job not found");
        }
        if (currentJob.isComplete) return     ApiError.NotFound("This Job already completed ")
        let isCompleted = true;
        let requiredThings:Partial<StepInterface> = {
            clickedOnAllImages:currentJob.clickedOnAllImages,
            clickedOnAllPackages:currentJob.clickedOnAllPackages,
            clickedOnFavorite:currentJob.clickedOnFavorite,
            clickedOnProfileLink:currentJob.clickedOnProfileLink
        };
        console.log('requiredThings:',requiredThings);
        console.log('steps.favorite:',steps.favorite,steps.favorite===false);
        if (currentJob.job.favorite) {
            if (steps.favorite || requiredThings.clickedOnFavorite) requiredThings.clickedOnFavorite = true;
           else if (steps.favorite===false){
                console.log('steps.favorite=false')
                requiredThings.clickedOnFavorite=false
                isCompleted = false;
            }
            else isCompleted = false;
        }
        if (currentJob.job.allPackages) {
            if (steps.allPackages || requiredThings.clickedOnAllPackages) requiredThings.clickedOnAllPackages = true;
         else   if (steps.allPackages===false){
                console.log('steps.allPackages=false')
                requiredThings.clickedOnAllPackages=false
                 isCompleted = false;
            }
         else isCompleted=false
        }
        if (currentJob.job.clickProfileLink) {
            if (steps.clickProfileLink || requiredThings.clickedOnProfileLink) requiredThings.clickedOnProfileLink = true;
            else if (steps.clickProfileLink===false){
                console.log('steps.clickProfile=false')
                requiredThings.clickedOnProfileLink=false
                isCompleted=false
            }
            else isCompleted = false;
        }
        if (currentJob.job.allImages) {
            if (steps.allImages || requiredThings.clickedOnAllImages) requiredThings.clickedOnAllImages = true;
            else if (steps.allImages===false){
                console.log('steps.allImages=false')
                requiredThings.clickedOnAllImages=false
                isCompleted = false
            }
            else isCompleted = false;
        }
        let countOfCompleted=currentJob.countOfCompleted
        if (isCompleted) {
            countOfCompleted++
            const user:any= await UserModel.findOne({_id:userId});
            if (!user) throw ApiError.NotFound("The user was not founded");
            if (!currentJob.isExchange){
                await UserModel.findOneAndUpdate({
                        _id:userId
                    },
                    {  balance:currentJob.job.price+user.balance }
                )
            }
            await HistoryModel.create({
                user:userId,
                job:currentJob.job.id,
                price:currentJob.isExchange ? 0: currentJob.job.price
            });
            await JobModel.findOneAndUpdate(
                {_id:currentJob.job._id},
                countOfCompleted
            )
        }
        await CurrentJobModel.findOneAndUpdate(
            { _id: jobId },
            { ...requiredThings, isComplete: isCompleted },
            { new: true })
            return await CurrentJobModel.findOne({ _id: jobId }).populate('job')
                .exec();
    }
    static async removeCurrentJob(jobId:number){
        const currentJob=await CurrentJobModel.findOne({_id:jobId});
        if (!currentJob) return  ApiError.NotFound("The currentJob weas not founded")
      await  CurrentJobModel.deleteOne({_id:jobId});
    }
    static async exchangeJobs(jobId,userId) {
        const job = await JobModel.findOne({_id: jobId});
        if (!job) throw  ApiError.NotFound("The job was not founded");
        let exchanges=await ExchangeModel.find({
            secondUser:userId,
        });
        let myJobs=await JobModel.find({
            author: userId
        })
        exchanges=JSON.parse(JSON.stringify(exchanges));
        myJobs=JSON.parse(JSON.stringify(myJobs))
       const exchange=exchanges.find(exchange=>{
           let foundedExchange
            myJobs.forEach(job=>{
                if (job._id===exchange.firstJob && !exchange.secondJob) foundedExchange=true
            })
           if (foundedExchange) return exchange
           return;
        });
        console.log('e:',exchange);
        if (!exchange){
            const result = await ExchangeModel.create({
                firstJob: jobId,
                secondUser: job.author,
                user: userId
            });
            const currentJob:any=await this.applyForJob(jobId, userId, true);
            const exchanges=  await ExchangeModel.findOne({_id: result._id})
                .populate({
                    path: "firstJob", populate: {
                        path: 'currentJob',
                        model: "currentJob",
                    }
                }).populate("user").populate("secondUser").exec();
            const e=JSON.parse(JSON.stringify(exchanges))
            const c=JSON.parse(JSON.stringify(currentJob));
            const job2=JSON.parse(JSON.stringify(job))
            console.log(e,currentJob,job2);
            return {...e,currentJob:c,job:job2}
        }
        else{
          const exchange2=await this.applyForExchange(exchange._id,jobId,userId);
            const e=JSON.parse(JSON.stringify(exchange2))
            console.log('e234:',e);
            let job2=JSON.parse(JSON.stringify(job))
            return {...e,job:job2}

        }
    }
   static async getCurrentJob(currentJobId){
        const currentJob=await CurrentJobModel.findOne({_id:currentJobId});
        if (!currentJob) return ApiError.NotFound("The current Job was not founded");
        return  currentJob
   }
    static async applyForExchange(exchangeId,jobId,userId){
        const exchange=await ExchangeModel.findOne({_id:exchangeId}).populate("user")
            .populate("firstJob").populate("secondJob").populate("secondUser").exec()
        const job = await JobModel.findOne({_id: jobId}).populate("author").exec();
        if (!job) throw  ApiError.NotFound("The job was not founded");
        if (!exchange) throw ApiError.NotFound("The exchange was not found");
        if (exchange.secondJob) throw  ApiError.defaultError("You can't apply for this exchange");
       const currentJob= await this.applyForJob(
            jobId,
            userId,true);
    /*    await this.applyForJob(
            exchange.firstJob._id,
            exchange.user._id,
            true,
        );*/
         await ExchangeModel.findOneAndUpdate(
            { _id:exchangeId},
            {secondJob:jobId},
            { new: true })
        let exchange2= await ExchangeModel.findOne({_id: exchangeId})
            .populate({
                path: "firstJob", populate: {
                    path: 'currentJob',
                    model: "currentJob",
                }
            }).populate("user").populate("secondUser").exec();
        exchange2=JSON.parse(JSON.stringify(exchange2))
        let c=JSON.parse(JSON.stringify(currentJob))
        console.log('exchange: ',exchange2);
        return {...exchange2,currentJob:c}
    }
    static async getExchanges(userId){
        let exchanges:any[] = await ExchangeModel.find({ secondUser: userId })
            .populate({path:"firstJob",populate:{
                    path: 'currentJob',
                    model:"currentJob"
                }})
            .populate({path:"secondJob",populate:{
                    path:"currentJob",
                    model:"currentJob"
                }}).exec();
        let myExchanges:any[]=await ExchangeModel.find({user:userId})
            .populate({path:"firstJob",populate:{
                    path: 'currentJob',
                    model:"currentJob",
                }})
            .populate({path:"secondJob",populate:{
                    path:"currentJob",
                    model:'currentJob'
                }}).exec();
        const el=[]
  /*      for (let exchange of exchanges){
            if (exchange?.firstJob?.currentJob?.length){
                exchange={...exchange,firstJob:{
                        ...exchange.firstJob,
                        currentJob:exchange.firstJob.currentJob.find(currentJob=>currentJob.job===exchange.firstJob._id)
                    }}
            }
            if (exchange?.secondJob?.currentJob?.length){
                exchange={...exchange,secondJob:{
                        ...exchange.secondJob,
                        currentJob:exchange.secondJob.currentJob.find(currentJob=>currentJob.job===exchange.secondJob._id)
                    }}
            }
            console.log('el',exchange);
            el.push(exchange);
        }*/
        exchanges=JSON.parse(JSON.stringify(exchanges))
        myExchanges=JSON.parse(JSON.stringify(myExchanges))
        exchanges=exchanges.map(exchange=>{
            if (exchange?.firstJob?.currentJob?.length){
                exchange={...exchange,firstJob:{
                        ...exchange.firstJob,
                        currentJob:exchange.firstJob.currentJob.find(currentJob=>currentJob.job===exchange.firstJob._id)
                    }}
            }
            console.log('el',exchange?.secondJob?.currentJob)
            if (exchange?.secondJob?.currentJob?.length){
                exchange={...exchange,secondJob:{
                        ...exchange.secondJob,
                        currentJob:exchange.secondJob.currentJob.find(currentJob=>currentJob.job===exchange.secondJob._id)
                    }}
            }
            return exchange
        });
        myExchanges=myExchanges.map(exchange=>{
            if (exchange?.firstJob?.currentJob?.length){
                exchange={...exchange,firstJob:{
                        ...exchange.firstJob,
                        currentJob:exchange.firstJob.currentJob.find(currentJob=>currentJob.job===exchange.firstJob._id)
                    }}
            }
            if (exchange?.secondJob?.currentJob?.length){
                exchange={...exchange,secondJob:{
                        ...exchange.secondJob,
                        currentJob:exchange.secondJob.currentJob.find(currentJob=>currentJob.job===exchange.secondJob._id)
                    }}
            }
            return exchange
        });
        console.log('e',exchanges);
        return {exchanges,
            myExchanges}
    }
   static async getCurrentJobByUrl(url){
        const currentJob=await CurrentJobModel.findOne({}).populate({
            path:"job",
            match:{categoryUrl:url}
        })
        if (!currentJob) return ApiError.NotFound("The job was not founded");
        return  currentJob
    }
}
