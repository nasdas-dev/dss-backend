const express = require("express");
const app = express();

const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://dario:${password}@ransomware-dss.l5t1r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(url);

const qSchema = new mongoose.Schema({
  id: Number,
  question: String,
  weight: Number,
  answers: [String],
  answerType: String,
});

const Question = mongoose.model("Question", qSchema);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

qData = require("./data.json");

qData.forEach((q) => {
  let newQ = new Question({
    id: q.id,
    question: q.question,
    weight: q.weight,
    answers: q.answers,
    answerType: q.answerType,
  });
  newQ.save();
});
