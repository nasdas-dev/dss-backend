const mongoose = require("mongoose");
const Question = mongoose.model(
  "Question",
  new mongoose.Schema({
    id: Number,
    category: String,
    question: String,
    weight: Number,
    answers: [Object],
    rationale: String,
    resultMap: [Object],
    answerType: String,
    bestpractice: String,
    role: String,
    applicability: [String],
    special_action: String,
  })
);
module.exports = Question;
