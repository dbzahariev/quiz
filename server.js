// Import npm packages
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");

const app = express();
const cors = require('cors')
const PORT = process.env.PORT || 8080; // Step 1

const routesQuiz = require("./routes/api/quiz");
const routesGamesDate = require("./routes/api/games");
// const routesChat = require("./routes/chat");

require("dotenv").config();

// Step 2
let newUrl =
    "mongodb+srv://ramsess90:Abc123456@cluster0.ewmw7.mongodb.net/db1?retryWrites=true&w=majority";
let oldUrl = "mongodb://localhost/mern_youtube";

if (process.env.MONGODB_URI === undefined) {
    console.log("Not found DB (process.env.MONGODB_URI)!");
}

mongoose.connect(process.env.MONGODB_URI || newUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected!!!!");
});

app.use(cors())
// Data parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Step 3

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

// HTTP request logger
app.use(morgan("tiny"));
app.use("/api/", routesQuiz);
app.use("/api/game/", routesGamesDate);

app.listen(PORT, console.log(`Server is starting at ${PORT}`));
