const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv").config({ path: "../config.env" });
const app = express();

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

const UserAnswer = require("../models/UserAnswer").UserAnswer;
const User = require("../models/User");
const { mongoose } = require("mongoose");
const Question = require("../models/Question");
const { syncBuiltinESMExports } = require("module");
const { evaluateAssessmentResultForUser } = require("../logic/evaluate");
const res = require("express/lib/response");

const createUser = function (
  name,
  email,
  password,
  answer,
  totalPenaltyPoints,
  techStack,
  elearningStatus,
  environment,
  role
) {
  const user = new User({
    name,
    email,
    password,
    answer,
    totalPenaltyPoints,
    techStack,
    elearningStatus,
    environment,
    role,
    manages: [],
    managedBy: [],
  });
  return user.save();
};
const createUserAnswer = function (answer) {
  const userAnswer = new UserAnswer({
    answer,
  });
  return userAnswer.save();
};
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// This section will help you get a list of all the records.
recordRoutes.route("/api/v1/questions").get(verifyJWT, function (req, res) {
  Question.find({}, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

recordRoutes.route("/api/v1/answer").get(function (req, res) {
  UserAnswer.find({}, function (err, result) {
    if (err) throw err;

    res.json(result);
  });
});
recordRoutes.route("/api/v1/users").get(verifyJWT, function (req, res) {
  User.find({}, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

recordRoutes.route("/api/v1/users/:uId").get(verifyJWT, function (req, res) {
  User.find({ id: req.params.uId }, function (err, user) {
    if (err) throw err;
    if (user.length === 0) {
      res.status(404).send("User not found");
    }
    res.status(200);
    res.json(user);
  });
});

recordRoutes.route("/api/v1/users/:uId").post(verifyJWT, function (req, res) {
  User.findById(req.body.manages, (err, user) => {
    if (user) {
      User.findById(req.params.uId, (err, user2) => {
        if (user2 && !user2.manages.includes(req.body.manages)) {
          User.findOneAndUpdate(
            { _id: req.params.uId },
            { $push: { manages: req.body.manages } },
            { new: true, upsert: true },
            function (err, user) {
              if (err) throw err;

              res.status(200);
              res.json(user);
            }
          );
        } else {
          res.status(400).send("User already manages this user");
        }
      });
    } else {
      res.status(400).send("User not found");
    }
  });
});

recordRoutes
  .route("/api/v1/users/:uId/elearning")
  .post(verifyJWT, function (req, res) {
    User.findById(req.params.uId, (err, user2) => {
      if (user2) {
        User.findOneAndUpdate(
          { _id: req.params.uId },
          { $push: { elearningStatus: req.body.elearning } },
          { new: true, upsert: true },
          function (err, user) {
            if (err) throw err;

            res.status(200);
            res.json(user);
          }
        );
      } else {
        res.status(404).send("No user found.");
      }
    });
  });

// This section will help you create a new record.
recordRoutes.route("/api/v1/users").post(function (req, response) {
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (err) throw err;

    let emptyAnswer = {};
    createUserAnswer(emptyAnswer)
      .then((u) => {
        let userRole = "";
        let userEnvironment = "";
        switch (req.body.role) {
          case "Administrator":
            userRole = "admin";
          case "Standard User":
            userRole = "user";
        }
        switch (req.body.environment) {
          case "Organisation":
            userEnvironment = "org";
          case "Private Usage":
            userEnvironment = "ind";
        }

        return createUser(
          req.body.name,
          req.body.email,
          hash,
          u,
          -1,
          [],
          [],
          userEnvironment,
          userRole
        );
      })
      .then((answer) => {
        console.log("created new answer object", answer);
        response.status(201);
        response.json({
          message: "User created successfully",
          status: 201,
        });
      })
      .catch((err) => console.log(err));
  });
});

recordRoutes.route("/api/v1/whoami").get(verifyJWT, function (req, response) {
  User.findOne({ email: req.user.email }, function (err, user) {
    if (err) throw err;
    console.log(req.user);
    console.log(1);
    console.log(user);
    response.status(200);
    response.json(user);
  });
});

recordRoutes
  .route("/api/v1/whoismanaged")
  .get(verifyJWT, function (req, response) {
    User.findOne({ id: req.body.manages }, function (err, user) {
      if (err) throw err;
      response.status(200);
      response.json(user);
    });
  });

function generateToken(user) {
  dotenv.parsed;
  return jwt.sign({ user }, process.env.TOKEN_SECRET, {
    expiresIn: "3600s",
  });
}

function verifyJWT(req, res, next) {
  const token = req.headers["x-access-token"]?.split(" ")[1];
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.json({
          isLoggedIn: false,
          message: "Auth failed",
          status: 401,
        });
      }
      req.user = decoded.user;
      console.log("-----------------------------------------------ver");
      console.log(req.user);
      next();
    });
  } else {
    return res.json({
      isLoggedIn: false,
      message: "Incrorrect token",
      status: 401,
    });
  }
}

// This section will help you login into your account.
recordRoutes.route("/api/v1/login").post(function (req, response) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) throw err;
    if (!user) {
      response.status(401);
      response.json({
        message: "Authentication failed. User not found.",
        status: 401,
      });
    } else {
      bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (err) throw err;
        if (result) {
          const token = generateToken(user);

          response.status(200);
          response.json({
            message: "Authentication successful.",
            uid: user.id,
            token: "Bearer " + token,
            status: 200,
          });
        } else {
          response.status(401);
          response.json({
            message: "Authentication failed. Wrong password.",
            status: 401,
          });
        }
      });
    }
  });
});
recordRoutes.route("/api/v1/assessment").post(verifyJWT, function (req, res) {
  let newAssessment = req.body.answers;
  let newAnswer = new UserAnswer({
    answer: newAssessment,
  });
  newAnswer.save(function (err, result) {
    if (err) throw err;
  });

  User.findOneAndUpdate(
    { _id: req.user._id },
    { answer: newAnswer },
    { new: true, upsert: true, populate: "answer" },
    function (err, doc) {
      if (err) throw err;
      console.log(doc);
      res.json(doc);

      evaluateAssessmentResultForUser(doc);
    }
  );
});

module.exports = recordRoutes;
