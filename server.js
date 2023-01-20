// Import npm packages
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const axios = require("axios")

const app = express();
const cors = require('cors')
const PORT = 8080; // Step 1

// const https = require("https")
// const { Server } = require("socket.io")
const http = require('http').Server(app);
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

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

// https://ramsess-quiz.onrender.com/socket.io/?EIO=4&transport=polling&t=ONGnqgc

// const server = http.createServer(app)
// const io = new Server(server,
//     {
//         cors: {
//             origin: ["http://localhost:3000", "https://ramsess-quiz.onrender.com", "https://ramsess-quiz-be.onrender.com", "*"],
//             allowedHeaders: ["my-custom-header"],
//             credentials: true
//         }
//     });

// const io = new Server(server, {

//     // cors: {
//     //     // origin: "http://localhost:* http://127.0.0.1:* https://ramsess-quiz.onrender.com:* https://ramsess-quiz-br.onrender.com:*"
//     //     // origin: "https://ramsess-quiz.onrender.com, http://localhost:8080/*"
//     //     origin: "*"
//     // }
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     },
//     withCredentials: true
// })

let users = []
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)
    socket.on("message", data => {
        socketIO.emit("messageResponse", data)
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

http.listen(PORT, console.log(`Server is starting at ${PORT}`));

// io.on("connection", (socket) => {
//     console.log("new user", socket.id)
//     socket.on("send_message", (data) => {
//         socket.broadcast.emit("receive_message", data)
//     })

//     socket.on('disconnect', () => {
//         console.log('Bye user');
//     });
// })