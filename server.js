require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./config");
const app = express();
mongoose.connect(
  config.database,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to the database");
    }
  }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
require('./firebase/index')
const userRoutes = require("./routes/useraccount");
const lawyerRoutes = require("./routes/lawyeraccount");

app.use("/api/useraccounts", userRoutes);
app.use("/api/lawyeraccounts", lawyerRoutes);
const port = process.env.PORT || 3000;
app.listen(port, (err) => {
  console.log("Listening at port" + port);
});
