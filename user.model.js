import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  signedMessage: String,
});

const User = model("User", UserSchema);

export default User;
