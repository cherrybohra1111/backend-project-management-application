import mongoose from "mongoose"
console.log(mongoose.version);

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅MongoDB connected");
    }
    catch (error) {
        console.error("❌MongoDB connection error", error);
        process.exit(1);
    }
};

export default connectDB;