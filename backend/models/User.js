import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.-]+@[\w-]+\.edu(\.\w+)?$/, "Please use a valid university (.edu) email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    campus: {
      type: String,
      trim: true,
    },
    trustScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model("User", userSchema);
export default User;