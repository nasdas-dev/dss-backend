const express = require("express");
const app = express();
const mongoose = require("mongoose");
const qData = require("./data.json");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://dario:${password}@ransomware-dss.l5t1r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(url);

const Question = require("./models/Question");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

qData.forEach((q) => {
  const newQ = new Question({
    id: q.id,
    category: q.category,
    question: q.question,
    weight: q.weight,
    answers: q.answers,
    rationale: q.rationale,
    resultMap: q.resultMap,
    bestpractice: q.bestpractice,
    role: q.role,
    applicability: q.applicability,
    special_action: q.special_action,
    answerType: q.answerType,
  });
  newQ.save();
});
