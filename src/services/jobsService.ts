import {UserModel, JobModel, CurrentJobModel, HistoryModel, ExchangeModel} from "../models/jobSchema"; // Import your Mongoose models
import ApiError from "../middlewares/api-error.middleware";
import { StepInterface } from "../interfaces/jobs.interfaces";
import * as mongoose from "mongoose";
import {scrapper} from "../utils/scrapper";
const urls=["https://www.fiverr.com/s/6386aP","https://www.fiverr.com/s/6386aP",
    "https://www.fiverr.com/s/6386aP","https://www.fiverr.com/s/6386aP","https://www.fiverr.com/s/6386aP"];
const filterJobs=(jobs,userId)=>{
    return [...jobs].filter(job=>{
        let isFounded=false
        if (!job.defaultJob){
            const currentJobsLength=job.currentJob.filter(job=>!job.isExchange && !job.isComplete).length
            if (job.availableCredits<=currentJobsLength || job.availableCredits<=0){
                isFounded=true
            }
        }
        job.currentJob.forEach((currentJob:any)=>{
            if (!currentJob.isExchange && currentJob.user==userId && currentJob.completedAt===new Date().toLocaleDateString()){
                isFounded=true
            }
        });
        return !isFounded
    });
}
const JOB_PRICE=1;
export class JobsService {
    static async deleteJob(id,userId){
        const job = await JobModel.findOne({_id:id}).populate("currentJob").exec();
        if (!job) throw  ApiError.NotFound("The job was not founded");
        if (userId!=job.author) throw  ApiError.defaultError("You don't have access to delete this");
        const lengthOfUncompletedCurrentJobs=job.currentJob.filter((c:any)=>!c.isComplete && !c.isExchange).length;
        const user=await UserModel.findOne({_id:userId});
        const count=job.currentJob.length-lengthOfUncompletedCurrentJobs;
       await UserModel.findOneAndUpdate({_id:userId},
           {balanceForJobs:user.balanceForJobs+count});
       await this.distributeCredits(userId,user.balanceForJobs+count)
        return await JobModel.findOneAndUpdate({_id:id},{isDeleted:true})
    }
    static async createJob(body, userId,defaultJob?:boolean) {
     const response=  await scrapper.getGigData(
body.url
     );
        let url = new URL(response.url);
        url.search = "";
        const updatedUrl = url.toString();
        console.log('updatedUrl:',updatedUrl);
        body = { ...body, integrity: undefined,category:response.gigCategory,
            gigId:response.gigId,subCategory:response.gigSubCategory,
            categoryUrl:response.gigCategoryUrl,gigAuthor:response.gigAuthor,url:updatedUrl};
        try {
            let author;
            if (!defaultJob){
                author = await UserModel.findById(userId);
                if (!author) {
                    throw ApiError.UnauthorizedError("The author was not found");
                }
            }
          const job= await JobModel.create({
                author: userId || undefined,
                favorite: false,
                allImages: false,
                allPackages: false,
                clickProfileLink: false,
                ...body,
                defaultJob,
                price: 1,
            });
            console.log('job',job)
            if (author){
                await this.distributeCredits(userId,author.balanceForJobs);
            }
            return  job
        } catch (e) {
            return e;
        }
    }
    static async getJobs(page,userId?:number) {
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        let [jobs, jobCount] = await Promise.all([
            JobModel.find({
                $and:[{ author:{$ne:userId}},{defaultJob:{$ne:true}},{isDeleted:false}],
            }).populate("currentJob").exec(),
            JobModel.countDocuments({
                $and:[{ author:{$ne:userId}},{isDeleted:false}]
            }),
        ]);
        jobs=filterJobs(jobs,userId)
        const jobsLength=jobs.length;
            let defaultJobs=await JobModel.find({defaultJob:true}).populate("currentJob").exec()
            if (!defaultJobs.length){
                for (let url of urls){
                    await JobsService.createJob({allImages:true,
                        clickProfileLink:true,allPackages:true,favorite:true,url},0,true)
                }
                const defaultJobs=await JobModel.find({defaultJob:true}).populate("currentJob").exec()
                return {data:defaultJobs,count:defaultJobs.length,availableJobs:defaultJobs.length}
            }
            defaultJobs=filterJobs(defaultJobs,userId);
            if (jobsLength===0){
                return  {data:defaultJobs,count:defaultJobs.length,availableJobs:defaultJobs.length}
            }
            let availableJobs=jobsLength+defaultJobs.length
        jobs =[...jobs].slice(skip, skip + pageSize);
        return { data: jobs, count: jobsLength,availableJobs };
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
        const job = await JobModel.findOne(
            {$and:[{_id:jobId},{isDeleted:{$ne:true}}
            ]}
            )
            .populate('currentJob')
            .exec();
        if (!job) throw ApiError.NotFound("The job was not found");
        if (job.availableCredits<=0 && !isExchange && !job.defaultJob) throw ApiError.defaultError("This job don't have credits!");
        const unCompletedJobs=job.currentJob.filter((job:any)=>!job.isComplete && !job.isExchange)
        if (!isExchange && unCompletedJobs.length>=job.availableCredits && !job.defaultJob) throw ApiError.defaultError("This job can't accept your apply!")
       job.currentJob.forEach((job:any)=>{
           const currentDate=new Date().toLocaleDateString();
                   if (!isExchange && job.user===userId && currentDate===job.completedAt) throw  ApiError.UnauthorizedError("Recently You applied for this job")
        });
        const c= await CurrentJobModel.create({
        job:jobId,
            user:userId,
            isExchange:isExchange || false,
        });
        const job2=await JobModel.findOne({$and:[{ _id:jobId},{isDeleted:{$ne:true}}]});
        job2.currentJob.push(c._id);
      await  job2.save();
        const currentJob=await CurrentJobModel.findOne({_id:c._id}).populate("job");
      return currentJob
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
    static async distributeCredits(userId,availableCredits){
        console.log('availableCredits:',availableCredits);
        const jobs=await JobModel.find({author:userId});
        console.log('jobsLength:',jobs.length);
        const creditPerJob=Math.floor(availableCredits/jobs.length)
        console.log('creditPerJob:',creditPerJob);
        const leftCredits=availableCredits-(creditPerJob*jobs.length);
        console.log('leftCredits:',leftCredits);
        const credits=Array(jobs.length).fill(creditPerJob);
        console.log('credits 1:',credits);
        for (let i=0;i<leftCredits;i++){
            credits[i]+=1
        }
        console.log('credits 2:',credits);
        for (let key in jobs){
            const job=jobs[key]
            console.log('key:',key);
            console.log('job:',job)
            await JobModel.findOneAndUpdate(
                {_id:job._id},
                {availableCredits:credits[key]}
            )
        }
    }
    static async updateCurrentJob(jobId, userId, steps:any) {
        const currentJob:any = await CurrentJobModel.findOne({ _id: jobId }).populate({
            path:"job",
            populate:{
                path:"author",
                model:"User"
            }
        })
            .exec();
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
        if (currentJob.job.favorite) {
            if (steps.favorite || requiredThings.clickedOnFavorite) requiredThings.clickedOnFavorite = true;
            else if (steps.favorite===false){
                requiredThings.clickedOnFavorite=false
                isCompleted=false
            }
            else isCompleted = false;
        }
        if (currentJob.job.allPackages) {
            if (steps.allPackages || requiredThings.clickedOnAllPackages) requiredThings.clickedOnAllPackages = true;
         else   if (steps.allPackages===false){
                requiredThings.clickedOnAllPackages=false
                 isCompleted = false;
            }
         else isCompleted=false
        }
        if (currentJob.job.clickProfileLink) {
            if (steps.clickProfileLink || requiredThings.clickedOnProfileLink) requiredThings.clickedOnProfileLink = true;
            else if (steps.clickProfileLink===false){
                requiredThings.clickedOnProfileLink=false
                isCompleted=false
            }
            else isCompleted = false;
        }
        if (currentJob.job.allImages) {
            if (steps.allImages || requiredThings.clickedOnAllImages) requiredThings.clickedOnAllImages = true;
            else if (steps.allImages===false){
                requiredThings.clickedOnAllImages=false
                isCompleted = false
            }
            else isCompleted = false;
        }
        let countOfCompleted=currentJob.job.countOfCompleted
        if (isCompleted) {
            countOfCompleted++
            const user:any= await UserModel.findOne({_id:userId});
            if (!user) throw ApiError.NotFound("The user was not founded");
            if (!currentJob.isExchange){
                await UserModel.findOneAndUpdate({
                        _id:userId
                    },
                    {  balance:JOB_PRICE+user.balance,
                        balanceForJobs:JOB_PRICE+user.balance }
                )
                await JobModel.findOneAndUpdate(
                    {_id:currentJob.job._id},
                    {countOfCompleted,availableCredits:currentJob.job.availableCredits-JOB_PRICE}
                );
                console.log('cec:',currentJob.job.author);
                if (currentJob.job.author){
                   await UserModel.findOneAndUpdate({
                            _id:currentJob.job.author._id,
                        },
                        {balanceForJobs:currentJob.job.author.balanceForJobs-JOB_PRICE,
                            balance:currentJob.job.author.balance-JOB_PRICE}
                    )
                }
                await this.distributeCredits(userId,JOB_PRICE+user.balanceForJobs)
            }
            else {
                await JobModel.findOneAndUpdate(
                    {_id:currentJob.job._id},
                    {countOfCompleted}
                );
            }
            await HistoryModel.create({
                user:userId,
                job:currentJob.job.id,
                price:currentJob.isExchange ? 0: currentJob.job.price
            });
        }
        await CurrentJobModel.findOneAndUpdate(
            { _id: jobId },
            { ...requiredThings, isComplete: isCompleted,completedAt:isCompleted ? new Date().toLocaleDateString():""},
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
        const job = await JobModel.findOne(
            {$and:[{_id:jobId},{isDeleted:{$ne:true}}
                ]}
        )
        if (!job) throw  ApiError.NotFound("The job was not founded");
        let exchanges=await ExchangeModel.find({
            secondUser:userId,
        });
        let myJobs=await JobModel.find({
            author: userId
        });
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
    static async apply(userId:number){
        const {data}=await this.getJobs(1,userId)
        if(data[0]){
            return await this.applyForJob(data[0]._id,userId);
        }
        throw ApiError.defaultError("No job at the moment!")
    }
}
