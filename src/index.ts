import express from "express"
import cors, {CorsOptions} from "cors"
import authMiddleware from "./middlewares/auth.middleware";
import {AuthController} from "./controllers/auth.controller";
import {JobsController} from "./controllers/jobs.controller";
import cookieParser from "cookie-parser";
import * as mongoose from "mongoose";
import checkParameterMiddleware from "./middlewares/check-parametr.middleware";
import {UserController} from "./controllers/user.controller";
import * as dotenv from 'dotenv';
const app = express();
const corsOptions:CorsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
    credentials: true,
}
dotenv.config();
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGODB_URI);
app.post("/login",AuthController.registration);
app.get("/jobs",authMiddleware(),JobsController.getJobs);
app.post("/jobs",authMiddleware(),JobsController.postJobs);
app.get("/currentJobs/getByUrl/:id",authMiddleware(),JobsController.getCurrentJobByUrl);
app.get("/currentJobs/:id",checkParameterMiddleware(),authMiddleware(),JobsController.getCurrentJob);
app.post("/applyForJob/:id",checkParameterMiddleware(),authMiddleware(),JobsController.applyForJob);
app.get("/currentJobs",authMiddleware(),JobsController.getCurrentJobs);
app.patch("/currentJobs/:id",authMiddleware(),JobsController.updateCurrentJobs);
app.get("/me",authMiddleware(),AuthController.getMe);
app.get("/history",authMiddleware(),UserController.getUserHistory);
app.post("/exchanges/:id",checkParameterMiddleware(),authMiddleware(),JobsController.exchangeJobs);
app.get("/exchanges",authMiddleware(),JobsController.getExchanges);
app.post("/applyExchanges/:id",checkParameterMiddleware(),authMiddleware(),JobsController.applyForExchange);
app.get('/myJobs',authMiddleware(),UserController.getMyJobs);
app.get("/myHistory",authMiddleware(),UserController.getMyHistory);
app.listen(5000, () => {
    console.log("Hello server start!")
});
export default app