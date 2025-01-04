const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Hello from Backend</h1>");
});

app.listen("8080", () => console.log("Server is listening to the port: 8000"));
