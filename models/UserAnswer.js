const mongoose = require("mongoose");
const UserAnswerSchema = new mongoose.Schema({
  answer: Object,
});
const UserAnswer = mongoose.model("UserAnswer", UserAnswerSchema);
module.exports = { UserAnswer, UserAnswerSchema };
