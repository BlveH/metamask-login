import mongoose from "mongoose";

export const connect = async () => {
  try {
    await mongoose.connect(
      "mongodb://admin:example@localhost:27017/?retryWrites=true&w=majority"
    );
    console.log("DB connect successfully");
  } catch (err) {
    console.log(err);
  }
};
