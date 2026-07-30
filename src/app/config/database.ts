import mongoose from "mongoose";
import config from "./env";

const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(config.database_url);
  console.log("MongoDB Connected");
};

export default connectDatabase;