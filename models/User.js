const mongoose = require("mongoose");
const UserAnswerSchema = require("./UserAnswer").UserAnswerSchema;

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  answer: UserAnswerSchema,
  totalPenaltyPoints: Number,
  environment: String,
  role: String,
  manages: [String],
  managedBy: [String],
});
const User = mongoose.model("User", UserSchema);

module.exports = User;
