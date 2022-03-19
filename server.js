const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(require("./routes/record"));
// get driver connection
const dbo = require("./db/conn");
const mongoose = require("mongoose");
const password = process.env.PASSWORD;

app.listen(port, () => {
  // perform a database connection when server starts
  mongoose
    .connect(
      `mongodb+srv://dario:${password}@ransomware-dss.l5t1r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("Successfully connect to MongoDB."))
    .catch((err) => console.error("Connection error", err));

  console.log(`Server is running on port: ${port}`);
});
