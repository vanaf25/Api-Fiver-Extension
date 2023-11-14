"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const jobSchema_1 = require("../models/jobSchema"); // Import your Mongoose models
const api_error_middleware_1 = __importDefault(require("../middlewares/api-error.middleware"));
const mongoose = __importStar(require("mongoose"));
const scrapper_1 = require("../utils/scrapper");
class JobsService {
    static async createJob(body, userId) {
        const response = await scrapper_1.scrapper.getGigData(body.url);
        let url = new URL(body.url);
        url.search = "";
        const updatedUrl = url.toString();
        body = { ...body, integrity: undefined, category: response.gigCategory,
            gigId: response.gigId, subCategory: response.gigSubCategory,
            categoryUrl: response.gigCategoryUrl, gigAuthor: response.gigAuthor, url: updatedUrl };
        try {
            const author = await jobSchema_1.UserModel.findById(userId);
            if (!author) {
                throw api_error_middleware_1.default.UnauthorizedError("The author was not found");
            }
            const newJob = new jobSchema_1.JobModel({
                author: userId,
                favorite: false,
                allImages: false,
                allPackages: false,
                clickProfileLink: false,
                ...body,
                price: 100,
            });
            return newJob.save();
        }
        catch (e) {
            return e;
        }
    }
    static async getJobs(page) {
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        const [jobs, jobCount] = await Promise.all([
            jobSchema_1.JobModel.find({}).skip(skip).limit(pageSize).populate("currentJob").exec(),
            jobSchema_1.JobModel.countDocuments({}),
        ]);
        return { data: jobs, count: jobCount };
    }
    static async getJobsByUserId(userId) {
        return await jobSchema_1.JobModel.find({ author: userId });
    }
    static async applyForJob(jobId, userId, isExchange) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return {};
            /*
                      return   throw ApiError.defaultError("Invalid jobId");
            */
        }
        const job = await jobSchema_1.JobModel.findOne({ _id: jobId })
            .populate('currentJob')
            .exec();
        job.currentJob.forEach((job) => {
            if (job === userId)
                return api_error_middleware_1.default.UnauthorizedError("Recently You applied for this job");
        });
        if (!job) {
            throw api_error_middleware_1.default.NotFound("Job not found");
        }
        const currentJob = new jobSchema_1.CurrentJobModel({
            job: jobId,
            user: userId,
            isExchange: isExchange || false
        });
        const c = await jobSchema_1.CurrentJobModel.create({
            job: jobId,
            user: userId,
            isExchange: isExchange || false
        });
        const job2 = await jobSchema_1.JobModel.findOne({ _id: jobId });
        job2.currentJob.push(c._id);
        await job2.save();
        return c;
    }
    static async getCurrentJobs(userId, page) {
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const [jobs, jobCount] = await Promise.all([
            jobSchema_1.CurrentJobModel.find({
                user: userId,
            })
                .skip(skip)
                .limit(pageSize)
                .populate('job')
                .exec(),
            jobSchema_1.CurrentJobModel.countDocuments({ user: userId }),
        ]);
        return { data: jobs, count: jobCount };
    }
    static async updateCurrentJob(jobId, userId, steps) {
        console.log('steps:', steps);
        const currentJob = await jobSchema_1.CurrentJobModel.findOne({ _id: jobId }).populate('job')
            .exec();
        console.log('currentJob:', currentJob);
        if (!currentJob) {
            return api_error_middleware_1.default.NotFound("Current job not found");
        }
        if (currentJob.isComplete)
            return api_error_middleware_1.default.NotFound("This Job already completed ");
        let isCompleted = true;
        let requiredThings = {
            clickedOnAllImages: currentJob.clickedOnAllImages,
            clickedOnAllPackages: currentJob.clickedOnAllPackages,
            clickedOnFavorite: currentJob.clickedOnFavorite,
            clickedOnProfileLink: currentJob.clickedOnProfileLink
        };
        console.log('requiredThings:', requiredThings);
        console.log('steps.favorite:', steps.favorite, steps.favorite === false);
        if (currentJob.job.favorite) {
            if (steps.favorite || requiredThings.clickedOnFavorite)
                requiredThings.clickedOnFavorite = true;
            else if (steps.favorite === false) {
                requiredThings.clickedOnFavorite = false;
                isCompleted = false;
            }
            else
                isCompleted = false;
        }
        if (currentJob.job.allPackages) {
            if (steps.allPackages || requiredThings.clickedOnAllPackages)
                requiredThings.clickedOnAllPackages = true;
            else if (steps.allPackages === false) {
                requiredThings.clickedOnAllPackages = false;
                isCompleted = false;
            }
            else
                isCompleted = false;
        }
        if (currentJob.job.clickProfileLink) {
            if (steps.clickProfileLink || requiredThings.clickedOnProfileLink)
                requiredThings.clickedOnProfileLink = true;
            else if (steps.clickProfileLink === false) {
                requiredThings.clickedOnProfileLink = false;
                isCompleted = false;
            }
            else
                isCompleted = false;
        }
        if (currentJob.job.allImages) {
            if (steps.allImages || steps.clickedOnAllImages)
                requiredThings.clickedOnAllImages = true;
            else if (steps.allImages === false) {
                requiredThings.clickedOnAllImages = false;
                isCompleted = false;
            }
            else
                isCompleted = false;
        }
        let countOfCompleted = currentJob.countOfCompleted;
        if (isCompleted) {
            countOfCompleted++;
            const user = await jobSchema_1.UserModel.findOne({ _id: userId });
            if (!user)
                throw api_error_middleware_1.default.NotFound("The user was not founded");
            if (!currentJob.isExchange) {
                await jobSchema_1.UserModel.findOneAndUpdate({
                    _id: userId
                }, { balance: currentJob.job.price + user.balance });
            }
            await jobSchema_1.HistoryModel.create({
                user: userId,
                job: currentJob.job.id,
                price: currentJob.isExchange ? 0 : currentJob.job.price
            });
            await jobSchema_1.JobModel.findOneAndUpdate({ _id: currentJob.job._id }, countOfCompleted);
        }
        await jobSchema_1.CurrentJobModel.findOneAndUpdate({ _id: jobId }, { ...requiredThings, isComplete: isCompleted }, { new: true });
        return await jobSchema_1.CurrentJobModel.findOne({ _id: jobId }).populate('job')
            .exec();
    }
    static async removeCurrentJob(jobId) {
        const currentJob = await jobSchema_1.CurrentJobModel.findOne({ _id: jobId });
        if (!currentJob)
            return api_error_middleware_1.default.NotFound("The currentJob weas not founded");
        await jobSchema_1.CurrentJobModel.deleteOne({ _id: jobId });
    }
    static async exchangeJobs(jobId, userId) {
        const job = await jobSchema_1.JobModel.findOne({ _id: jobId });
        if (!job)
            throw api_error_middleware_1.default.NotFound("The job was not founded");
        let exchanges = await jobSchema_1.ExchangeModel.find({
            secondUser: userId,
        });
        let myJobs = await jobSchema_1.JobModel.find({
            author: userId
        });
        exchanges = JSON.parse(JSON.stringify(exchanges));
        myJobs = JSON.parse(JSON.stringify(myJobs));
        const exchange = exchanges.find(exchange => {
            let foundedExchange;
            myJobs.forEach(job => {
                if (job._id === exchange.firstJob && !exchange.secondJob)
                    foundedExchange = true;
            });
            if (foundedExchange)
                return exchange;
            return;
        });
        console.log('e:', exchange);
        if (!exchange) {
            const result = await jobSchema_1.ExchangeModel.create({
                firstJob: jobId,
                secondUser: job.author,
                user: userId
            });
            const currentJob = await this.applyForJob(jobId, userId, true);
            const exchanges = await jobSchema_1.ExchangeModel.findOne({ _id: result._id })
                .populate({
                path: "firstJob", populate: {
                    path: 'currentJob',
                    model: "currentJob",
                }
            }).populate("user").populate("secondUser").exec();
            const e = JSON.parse(JSON.stringify(exchanges));
            const c = JSON.parse(JSON.stringify(currentJob));
            const job2 = JSON.parse(JSON.stringify(job));
            console.log(e, currentJob, job2);
            return { ...e, currentJob: c, job: job2 };
        }
        else {
            const exchange2 = await this.applyForExchange(exchange._id, jobId, userId);
            const e = JSON.parse(JSON.stringify(exchange2));
            console.log('e234:', e);
            let job2 = JSON.parse(JSON.stringify(job));
            return { ...e, job: job2 };
        }
    }
    static async getCurrentJob(currentJobId) {
        const currentJob = await jobSchema_1.CurrentJobModel.findOne({ _id: currentJobId });
        if (!currentJob)
            return api_error_middleware_1.default.NotFound("The current Job was not founded");
        return currentJob;
    }
    static async applyForExchange(exchangeId, jobId, userId) {
        const exchange = await jobSchema_1.ExchangeModel.findOne({ _id: exchangeId }).populate("user")
            .populate("firstJob").populate("secondJob").populate("secondUser").exec();
        const job = await jobSchema_1.JobModel.findOne({ _id: jobId }).populate("author").exec();
        if (!job)
            return api_error_middleware_1.default.NotFound("The job was not founded");
        if (!exchange)
            throw api_error_middleware_1.default.NotFound("The exchange was not found");
        if (exchange.secondJob)
            return api_error_middleware_1.default.defaultError("You can't apply for this exchange");
        const currentJob = await this.applyForJob(jobId, userId, true);
        /*    await this.applyForJob(
                exchange.firstJob._id,
                exchange.user._id,
                true,
            );*/
        await jobSchema_1.ExchangeModel.findOneAndUpdate({ _id: exchangeId }, { secondJob: jobId }, { new: true });
        let exchange2 = await jobSchema_1.ExchangeModel.findOne({ _id: exchangeId })
            .populate({
            path: "firstJob", populate: {
                path: 'currentJob',
                model: "currentJob",
            }
        }).populate("user").populate("secondUser").exec();
        exchange2 = JSON.parse(JSON.stringify(exchange2));
        let c = JSON.parse(JSON.stringify(currentJob));
        console.log('exchange: ', exchange2);
        return { ...exchange2, currentJob: c };
    }
    static async getExchanges(userId) {
        let exchanges = await jobSchema_1.ExchangeModel.find({ secondUser: userId })
            .populate({ path: "firstJob", populate: {
                path: 'currentJob',
                model: "currentJob"
            } })
            .populate({ path: "secondJob", populate: {
                path: "currentJob",
                model: "currentJob"
            } }).exec();
        let myExchanges = await jobSchema_1.ExchangeModel.find({ user: userId })
            .populate({ path: "firstJob", populate: {
                path: 'currentJob',
                model: "currentJob",
            } })
            .populate({ path: "secondJob", populate: {
                path: "currentJob",
                model: 'currentJob'
            } }).exec();
        const el = [];
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
        exchanges = JSON.parse(JSON.stringify(exchanges));
        myExchanges = JSON.parse(JSON.stringify(myExchanges));
        exchanges = exchanges.map(exchange => {
            if (exchange?.firstJob?.currentJob?.length) {
                exchange = { ...exchange, firstJob: {
                        ...exchange.firstJob,
                        currentJob: exchange.firstJob.currentJob.find(currentJob => currentJob.job === exchange.firstJob._id)
                    } };
            }
            console.log('el', exchange?.secondJob?.currentJob);
            if (exchange?.secondJob?.currentJob?.length) {
                exchange = { ...exchange, secondJob: {
                        ...exchange.secondJob,
                        currentJob: exchange.secondJob.currentJob.find(currentJob => currentJob.job === exchange.secondJob._id)
                    } };
            }
            return exchange;
        });
        myExchanges = myExchanges.map(exchange => {
            if (exchange?.firstJob?.currentJob?.length) {
                exchange = { ...exchange, firstJob: {
                        ...exchange.firstJob,
                        currentJob: exchange.firstJob.currentJob.find(currentJob => currentJob.job === exchange.firstJob._id)
                    } };
            }
            if (exchange?.secondJob?.currentJob?.length) {
                exchange = { ...exchange, secondJob: {
                        ...exchange.secondJob,
                        currentJob: exchange.secondJob.currentJob.find(currentJob => currentJob.job === exchange.secondJob._id)
                    } };
            }
            return exchange;
        });
        console.log('e', exchanges);
        return { exchanges,
            myExchanges };
    }
    static async getCurrentJobByUrl(url) {
        const currentJob = await jobSchema_1.CurrentJobModel.findOne({}).populate({
            path: "job",
            match: { categoryUrl: url }
        });
        if (!currentJob)
            return api_error_middleware_1.default.NotFound("The job was not founded");
        return currentJob;
    }
}
exports.JobsService = JobsService;
