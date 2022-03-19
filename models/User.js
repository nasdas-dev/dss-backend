const mongoose = require("mongoose");
const UserAnswerSchema = require("./UserAnswer").UserAnswerSchema;
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    answer: UserAnswerSchema,
  })
);

module.exports = User;
