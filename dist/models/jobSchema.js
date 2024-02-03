"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeModel = exports.HistoryModel = exports.CurrentJobModel = exports.JobModel = exports.TokenModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    myJobs: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Job' }],
    currentJobs: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'currentJob' }],
    tokens: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Token' }],
    balance: { type: Number, default: 0 },
    balanceForJobs: { type: Number, default: 0 },
    histories: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "History" }],
    exchanges: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Exchange" }],
    ip: { type: String, required: true, default: "" }
}, {
    versionKey: false
});
const tokenSchema = new mongoose_1.default.Schema({
    token: { type: String, required: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
}, { versionKey: false });
const jobSchema = new mongoose_1.default.Schema({
    favorite: { type: Boolean, default: false },
    allImages: { type: Boolean, default: false },
    allPackages: { type: Boolean, default: false },
    clickProfileLink: { type: Boolean, default: false },
    url: { type: String },
    createdAt: { type: Date, default: Date.now },
    gigId: { type: Number, required: false, default: 0 },
    category: { type: String, required: false, default: "" },
    subCategory: { type: String, required: false, default: "" },
    gigAuthor: { type: String, required: true, default: "" },
    categoryUrl: { type: String, required: false, default: "" },
    author: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number },
    defaultJob: { type: Boolean, default: false },
    currentJob: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'currentJob' }],
    histories: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "History" }],
    exchanges: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Exchange" }],
    countOfCompleted: { type: Number, default: 0 },
    availableCredits: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false });
const currentJobSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    jobId: { type: Number },
    clickedOnFavorite: { type: Boolean, default: false },
    clickedOnAllPackages: { type: Boolean, default: false },
    clickedOnProfileLink: { type: Boolean, default: false },
    clickedOnAllImages: { type: Boolean, default: false },
    isComplete: { type: Boolean, default: false },
    job: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Job' },
    isExchange: { type: Boolean, default: false },
    completedAt: { type: String, default: "" }
}, { versionKey: false });
const historySchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    job: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Job" },
    completedAt: { type: Date, default: Date.now },
    price: { type: Number, default: 0 }
}, { versionKey: false });
const exchangeSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    secondUser: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    firstJob: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Job" },
    secondJob: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Job" },
}, { versionKey: false });
exports.UserModel = mongoose_1.default.model('User', userSchema);
exports.TokenModel = mongoose_1.default.model('Token', tokenSchema);
exports.JobModel = mongoose_1.default.model('Job', jobSchema);
exports.CurrentJobModel = mongoose_1.default.model('currentJob', currentJobSchema);
exports.HistoryModel = mongoose_1.default.model("History", historySchema);
exports.ExchangeModel = mongoose_1.default.model("Exchange", exchangeSchema);
console.log('some logs');
