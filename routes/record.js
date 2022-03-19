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

const createUser = function (name, email, password, answer) {
  const user = new User({
    name,
    email,
    password,
    answer,
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
recordRoutes.route("/api/v1/questions").get(function (req, res) {
  let db_connect = dbo.getDb("myFirstDatabase");
  db_connect
    .collection("questions")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

// This section will help you get a single record by id
recordRoutes.route("/api/v1/record/:id").get(function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("records").findOne(myquery, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

recordRoutes.route("/api/v1/users").get(function (req, res) {
  let db_connect = dbo.getDb("myFirstDatabase");
  db_connect
    .collection("users")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.status(200);
      res.json(result);
    });
});

// This section will help you create a new record.
recordRoutes.route("/api/v1/users").post(function (req, response) {
  // let db_connect = dbo.getDb()

  // let newUser = {
  //   _id: ObjectId(req.params.id),
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  // };

  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (err) throw err;

    let emptyAnswer = {};
    createUserAnswer(emptyAnswer)
      .then((u) => {
        return createUser(req.body.name, req.body.email, hash, u);
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

    // db_connect.collection("users").insertOne(newUser, function (err, res) {
    //   if (err) throw err;
    //   response.status(200);
    //   response.json(res);
    // });
  });
});
function generateToken(user) {
  dotenv.parsed;
  return jwt.sign(user, process.env.TOKEN_SECRET, {
    expiresIn: "3600s",
  });
}

// This section will help you login into your account.
recordRoutes.route("/api/v1/login").post(function (req, response) {
  let db_connect = dbo.getDb("myFirstDatabase");
  db_connect
    .collection("users")
    .findOne({ user_email: req.body.email }, function (err, db_user) {
      if (err) throw err;
      if (db_user) {
        bcrypt.compare(
          req.body.password,
          db_user.user_password,
          function (err, res) {
            if (err) throw err;
            if (res) {
              let returnUser = {
                uid: db_user._id,
                email: db_user.user_email,
                token: generateToken(db_user),
              };
              response.status(200);
              response.json(returnUser);
            } else {
              response.status(401);
              response.json({ message: "Invalid password" });
            }
          }
        );
      } else {
        response.status(401);
        response.json({ message: "Invalid email" });
      }
    });
});

recordRoutes.route("/api/v1/assessment").post(function (req, response) {
  let db_connect = dbo.getDb("myFirstDatabase");
  let newAssessment = req.body.answers;
  let user = req.body.user;
  console.log(newAssessment);
  console.log(user);
});

module.exports = recordRoutes;
