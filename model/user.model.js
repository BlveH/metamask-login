import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  signature: { type: String, index: true, unique: true },
  nonce: String,
});

const User = model("User", UserSchema);

export default User;
