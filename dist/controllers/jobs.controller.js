"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const jobsService_1 = require("../services/jobsService");
const api_error_middleware_1 = __importDefault(require("../middlewares/api-error.middleware"));
class JobsController {
    static async getJobs(req, res, next) {
        try {
            const { page = 1 } = req.query;
            const userId = req.body.identity.id;
            const jobs = await jobsService_1.JobsService.getJobs(+page, userId);
            return res.json(jobs);
        }
        catch (error) {
            if (error instanceof api_error_middleware_1.default) {
                // Повертаємо відповідь клієнту з використанням властивостей з вашого класу ApiError
                console.log('err:', error.statusCode);
                res.status(error.statusCode).json({ error: { message: error.message } });
            }
            else {
                // Інші неочікувані помилки обробляються власним способом
                next(error);
            }
        }
    }
    static async postJobs(req, res, next) {
        try {
            const body = req.body;
            const userId = req.body.identity.id;
            const result = await jobsService_1.JobsService.createJob(body, userId);
            return res.json({ result });
        }
        catch (error) {
            // Перевірка, чи об'єкт помилки є екземпляром ApiError
            if (error instanceof api_error_middleware_1.default) {
                // Повертаємо відповідь клієнту з використанням властивостей з вашого класу ApiError
                console.log('err:', error.statusCode);
                res.status(error.statusCode).json({ error: { message: error.message } });
            }
            else {
                // Інші неочікувані помилки обробляються власним способом
                next(error);
            }
        }
    }
    static async deleteJob(req, res, next) {
        try {
            const id = req?.params?.id;
            const userId = req.body.identity.id;
            const result = await jobsService_1.JobsService.deleteJob(id, userId);
            res.json(result);
        }
        catch (error) {
            if (error instanceof api_error_middleware_1.default) {
                res.status(error.statusCode).json({ error: { message: error.message } });
            }
            else {
                next(error);
            }
        }
    }
    static async applyForJob(req, res, next) {
        try {
            const id = req?.params?.id;
            const userId = req.body.identity.id;
            const result = await jobsService_1.JobsService.applyForJob(id, userId);
            res.json({ result });
        }
        catch (error) {
            if (error instanceof api_error_middleware_1.default) {
                res.status(error.statusCode).json({ error: { message: error.message } });
            }
            else {
                next(error);
            }
        }
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
        const result = await jobsService_1.JobsService.updateCurrentJob(jobId, userId, body);
        return res.json(result);
    }
    static async exchangeJobs(req, res, next) {
        try {
            const userId = req.body?.identity?.id;
            const jobId = req.params.id;
            const result = await jobsService_1.JobsService.exchangeJobs(jobId, userId);
            return res.json(result);
        }
        catch (error) {
            // Перевірка, чи об'єкт помилки є екземпляром ApiError
            if (error instanceof api_error_middleware_1.default) {
                // Повертаємо відповідь клієнту з використанням властивостей з вашого класу ApiError
                console.log('err:', error.statusCode);
                res.status(error.statusCode).json({ error: { message: error.message } });
            }
            else {
                // Інші неочікувані помилки обробляються власним способом
                next(error);
            }
        }
    }
    static async applyForExchange(req, res, next) {
        try {
            const userId = req.body?.identity?.id;
            const exchangeId = req.params.id;
            const jobId = req.body.jobId;
            const result = await jobsService_1.JobsService.applyForExchange(exchangeId, jobId, userId);
            return res.json(result);
        }
        catch (error) {
            if (error instanceof api_error_middleware_1.default) {
                res.status(error.statusCode).json({ error: { message: error.message } });
            }
            else {
                next(error);
            }
        }
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
    static async apply(req, res, next) {
        try {
            console.log('apply!!!');
            const userId = req.body.identity.id;
            const result = await jobsService_1.JobsService.apply(userId);
            return res.json(result);
        }
        catch (error) {
            if (error instanceof api_error_middleware_1.default) {
                res.status(error.statusCode).json({ error: { message: error.message } });
            }
            else {
                next(error);
            }
        }
    }
}
exports.JobsController = JobsController;
