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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_middleware_1 = __importDefault(require("./middlewares/auth.middleware"));
const auth_controller_1 = require("./controllers/auth.controller");
const jobs_controller_1 = require("./controllers/jobs.controller");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose = __importStar(require("mongoose"));
const check_parametr_middleware_1 = __importDefault(require("./middlewares/check-parametr.middleware"));
const user_controller_1 = require("./controllers/user.controller");
const dotenv = __importStar(require("dotenv"));
const app = (0, express_1.default)();
const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
    credentials: true,
};
dotenv.config();
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGODB_URI);
app.post("/login", auth_controller_1.AuthController.registration);
app.get("/jobs", (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.getJobs);
app.post("/jobs", (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.postJobs);
app.get("/currentJobs/getByUrl/:id", (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.getCurrentJobByUrl);
app.get("/currentJobs/:id", (0, check_parametr_middleware_1.default)(), (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.getCurrentJob);
app.post("/applyForJob/:id", (0, check_parametr_middleware_1.default)(), (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.applyForJob);
app.get("/currentJobs", (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.getCurrentJobs);
app.patch("/currentJobs/:id", (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.updateCurrentJobs);
app.get("/me", (0, auth_middleware_1.default)(), auth_controller_1.AuthController.getMe);
app.get("/history", (0, auth_middleware_1.default)(), user_controller_1.UserController.getUserHistory);
app.post("/exchanges/:id", (0, check_parametr_middleware_1.default)(), (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.exchangeJobs);
app.get("/exchanges", (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.getExchanges);
app.post("/applyExchanges/:id", (0, check_parametr_middleware_1.default)(), (0, auth_middleware_1.default)(), jobs_controller_1.JobsController.applyForExchange);
app.get('/myJobs', (0, auth_middleware_1.default)(), user_controller_1.UserController.getMyJobs);
app.listen(5000, () => {
    console.log("Hello server start!");
});
exports.default = app;
