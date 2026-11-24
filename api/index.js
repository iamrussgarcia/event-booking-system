const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const app = express();

const user = require("./routes/user.js");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", user);

mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once("open", () => console.log("Connected to MongoDB Atlas"));


if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at port ${process.env.PORT || 3000}`);
  });
}

module.exports = app;