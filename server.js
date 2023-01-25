// Import npm packages
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

const app = express();
const cors = require('cors')
const PORT = process.env.PORT || 8080; // Step 1

const http = require('http').Server(app);
const socketIO = require('socket.io')(http, {
    cors: {
        origin: ["https://ramsess-quiz.onrender.com", "http://localhost:3000"]
    }
});

const routesQuiz = require("./routes/api/quiz");
const routesGamesDate = require("./routes/api/games");

require("dotenv").config();

// Step 2
let newUrl =
    "mongodb+srv://ramsess90:Abc123456@cluster0.ewmw7.mongodb.net/db1?retryWrites=true&w=majority";

if (process.env.MONGODB_URI === undefined) {
    console.log("Not found DB (process.env.MONGODB_URI)!");
}

mongoose.connect(process.env.MONGODB_URI || newUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected!!!!",);
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



// START SOCKET.IO
let users = []
let allQuestions = []
let currentQuestion = {}
let hoverOption = ""
let AddedMeme = []
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)
    socket.on("message", data => {
        socketIO.emit("messageResponse", data)
    })

    socket.on("Add meme", data => {
        AddedMeme.push(data)
    })

    socket.on("GetAddedMemes", data => {
        socketIO.emit("notification", { msg: "Give you all Added meme", AddedMeme })
    })

    socket.on("SetCurrentQuestion", (data) => {
        currentQuestion = data
        socketIO.emit("notification", { msg: "set current question", currentQuestion })
    })

    socket.on("GetCurrentQuestion", data => {
        socketIO.emit("getCurrentQuestion", { msg: "Current question is: ", currentQuestion })
    })

    socket.on("OnHover", data => {
        hoverOption = data
        socketIO.emit("notification", { msg: "Hover on", option: data })
    })

    socket.on("OffHover", data => {
        hoverOption = ""
        socketIO.emit("notification", { msg: "Hover off", option: data })
    })

    socket.on("AddQuestionAll", data => {
        allQuestions = data
        socketIO.emit("notification", { msg: "Added all question" })
    })

    socket.on("GetAllQuestion", data => {
        socketIO.emit("notification", { msg: "Give you all Questions", allQuestions })
    })

    socket.on("get-all-users", data => {
        socket.broadcast.emit("notification", { data, users })
        socketIO.emit("notification", { data, users })
    })

    socket.on("typing", data => (
        socket.broadcast.emit("typingResponse", data)
    ))

    socket.on("newUser", data => {
        users.push(data)
        socketIO.emit("newUserResponse", users)
    })

    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected', socket.id);
        users = users.filter(user => user.socketID !== socket.id)
        socketIO.emit("newUserResponse", users)
        socket.disconnect()
    });
})
// END SOCKET.IO



http.listen(PORT, console.log(`Server is starting at ${PORT}`));
