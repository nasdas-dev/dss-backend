const express = require("express");
const data = require("./data.json");
const fs = require("fs");
const app = express();

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/questions", (request, response) => {
  response.json(data);
});

app.get("/api/questions/:id", (request, response) => {
  const id = request.params.id;
  const q = data.find((q) => String(q.id) === id);
  response.json(q);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
