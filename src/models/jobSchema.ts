import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    myJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    currentJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'currentJob' }],
    tokens: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Token' }],
    balance: { type: Number, default: 0 },
    histories:[{type:mongoose.Schema.Types.ObjectId,ref:"History"}],
    exchanges:[{type:mongoose.Schema.Types.ObjectId,ref:"Exchange"}],
    ip:{type:String,required:true,default:""}
    },{
    versionKey:false
    }
);
const tokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},{versionKey:false});
const jobSchema = new mongoose.Schema({
    favorite: { type: Boolean, default: false },
    allImages: { type: Boolean, default: false },
    allPackages: { type: Boolean, default: false },
    clickProfileLink: { type: Boolean, default: false },
    url: { type: String },
    createdAt:{type:Date,default:Date.now},
    gigId:{type:Number,required:false,default:0},
    category:{type:String,required: false,default:""},
    subCategory:{type:String,required:false,default:""},
    gigAuthor:{type:String,required:true,default:""},
    categoryUrl:{type:String,required:false,default:""},
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number },
    currentJob: [{ type: mongoose.Schema.Types.ObjectId, ref: 'currentJob' }],
    histories:[{type:mongoose.Schema.Types.ObjectId,ref:"History"}],
    exchanges:[{type:mongoose.Schema.Types.ObjectId,ref:"Exchange"}],
    countOfCompleted:{type:Number,default:0},
},{versionKey:false});
const currentJobSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jobId: { type: Number },
    clickedOnFavorite: { type: Boolean, default: false },
    clickedOnAllPackages: { type: Boolean, default: false },
    clickedOnProfileLink: { type: Boolean, default: false },
    clickedOnAllImages: { type: Boolean, default: false },
    isComplete: { type: Boolean, default: false },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    isExchange:{type:Boolean,default:false}
},{versionKey:false});
const historySchema=new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    job:{type:mongoose.Schema.Types.ObjectId,ref:"Job"},
    completedAt:{type:Date,default:Date.now},
    price:{type:Number,default:0}
},{versionKey:false});
const exchangeSchema=new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    secondUser:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    firstJob:{type:mongoose.Schema.Types.ObjectId,ref:"Job"},
    secondJob:{type:mongoose.Schema.Types.ObjectId,ref:"Job"},
},{versionKey:false});
export const UserModel = mongoose.model('User', userSchema);
export const TokenModel = mongoose.model('Token', tokenSchema);
 export const JobModel = mongoose.model('Job', jobSchema);
export const CurrentJobModel = mongoose.model('currentJob', currentJobSchema);
export const HistoryModel=mongoose.model("History",historySchema);
export const ExchangeModel=mongoose.model("Exchange",exchangeSchema)