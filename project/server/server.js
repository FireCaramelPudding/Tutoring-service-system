const express = require("express");
const userroute = require("./routeReg.js");
const cors = require("cors");
var querystring = require("querystring");
var session = require("express-session");

const app = express();

app.use(cors());
app.use(
  session({
    secret: "hello",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static("../../project/"));
app.use(userroute);

app.listen(3000, () => {
  console.log("express server running at http://127.0.0.1");
});
