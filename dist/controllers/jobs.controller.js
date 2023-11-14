"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const jobsService_1 = require("../services/jobsService");
class JobsController {
    static async getJobs(req, res) {
        const { page = 1 } = req.query;
        const jobs = await jobsService_1.JobsService.getJobs(+page);
        return res.json(jobs);
    }
    static async postJobs(req, res) {
        const body = req.body;
        const userId = req.body.identity.id;
        const result = await jobsService_1.JobsService.createJob(body, userId);
        return res.json({ result });
    }
    static async applyForJob(req, res) {
        const id = req?.params?.id;
        const userId = req.body.identity.id;
        console.log(userId);
        console.log(req.body);
        const result = await jobsService_1.JobsService.applyForJob(id, userId);
        /* const currentJob=await prisma.currentJob.findUnique({
             where:{id:result.id},
             include:{job:true}
         });*/
        res.json({ result });
    }
    static async getCurrentJob(req, res) {
        const { id } = req.params;
        const job = await jobsService_1.JobsService.getCurrentJob(id);
        res.json(job);
    }
    static async getCurrentJobs(req, res) {
        const userId = req.body?.identity?.id;
        const { page = 1 } = req.query;
        const jobs = await jobsService_1.JobsService.getCurrentJobs(userId, page);
        res.json(jobs);
    }
    static async updateCurrentJobs(req, res) {
        const userId = req.body?.identity?.id;
        const jobId = req.params.id;
        const body = req.body;
        console.log('body:', req.body);
        const result = await jobsService_1.JobsService.updateCurrentJob(jobId, userId, body);
        return res.json(result);
    }
    static async exchangeJobs(req, res) {
        const userId = req.body?.identity?.id;
        const jobId = req.params.id;
        const result = await jobsService_1.JobsService.exchangeJobs(jobId, userId);
        return res.json(result);
    }
    static async applyForExchange(req, res) {
        const userId = req.body?.identity?.id;
        const exchangeId = req.params.id;
        const jobId = req.body.jobId;
        const result = await jobsService_1.JobsService.applyForExchange(exchangeId, jobId, userId);
        return res.json(result);
    }
    static async getExchanges(req, res) {
        const userId = req.body?.identity?.id;
        const result = await jobsService_1.JobsService.getExchanges(userId);
        res.json(result);
    }
    static async getCurrentJobByUrl(req, res) {
        const { id } = req.params;
        return await jobsService_1.JobsService.getCurrentJobByUrl(id);
    }
}
exports.JobsController = JobsController;
