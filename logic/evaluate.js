const Question = require("../models/Question");
const User = require("../models/User");

let totalPenaltyPoints = 0;
let errors = [];
let techStack = [];

function evaluateAssessmentResultForUser(u) {
  let userAnswers = u.answer.answer;
  // '0': { '0': true, '1': false, '2': true },
  // '2': { '0': true, '1': false, '2': false },
  // '9': { '0': false, '1': false, '2': true, '3': false },
  // '11': { '0': false, '1': false, '2': false, '3': true },
  // '15': { '0': false, '1': false, '2': true },
  // '19': { '0': true }
  // }
  console.log("userAnswers", userAnswers);
  totalPenaltyPoints = 0;
  for (let [answeredQuestion, index] of Object.entries(userAnswers)) {
    Question.findOne(
      { id: answeredQuestion },
      {},
      {},
      function (err, question) {
        for (let answerOption in userAnswers[answeredQuestion]) {
          console.log(
            "answer: " +
              answerOption +
              " value: " +
              userAnswers[answeredQuestion][answerOption]
          );

          if (question.special_action === "populate_techstack") {
            techStack.push(userAnswers[answeredQuestion][answerOption]);
          }

          if (userAnswers[answeredQuestion][answerOption] === true) {
            if (question.resultMap[answerOption[0]] === undefined) {
              return;
            }

            totalPenaltyPoints +=
              question.weight *
              question.resultMap[answerOption][Number(answerOption) + 1];

            if (
              question.resultMap[answerOption][Number(answerOption) + 1] != 0
            ) {
              if (!errors.includes(question.id)) {
                errors.push(question.id);
              }
            }
          }
        }
        User.findOneAndUpdate(
          { _id: u._id },
          {
            totalPenaltyPoints: totalPenaltyPoints,
            errors: errors,
            techStack: techStack,
          },
          { new: true, upsert: true, populate: "answer" },
          function (err, doc) {
            if (err) throw err;
            console.log(doc);
          }
        );
      }
    );
  }
}

module.exports = { evaluateAssessmentResultForUser };
