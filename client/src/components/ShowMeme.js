import React, { useState, useEffect } from 'react'
import ShowPictures from './showPictures'

import io from "socket.io-client"
import { SOCKET_IO_SERVER } from "../Helper"

const socket = io.connect(SOCKET_IO_SERVER)

const texts = {
  correctAnswer: "correctAnswer",
  wrongAnswer: "wrongAnswer"
}

export let correctImages = ["https://i.ibb.co/LPts7cQ/Az-sam-maisor-na-kuizovete.png", "https://i.ibb.co/CWrgvR7/download-4.png"]
export let wrongImages = ["https://i.ibb.co/qFHngGq/download-7.png"]

function ShowMeme({ type, pauseFor, addText }) {
  const [addTextState, setAddTextState] = useState(addText)
  const [returnImg2, setReturnImg2] = useState("")
  const [expiredMeme, setExpiredMeme] = useState([])

  useEffect(() => {
    if (pauseFor === texts.correctAnswer) {
      setAddTextState("Верен отговор")
    }
    if (pauseFor === texts.wrongAnswer) {
      setAddTextState("Грешен отговор")
    }
  }, [pauseFor])

  useEffect(() => {
    setReturnImg2(returnImg())
    socket.emit("GetAddedMemes")
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    socket.on("notification", (data) => {
      if (data.msg === "Give you all Added meme") {
        let allAddedMeme = data.AddedMeme
        setExpiredMeme(allAddedMeme)
      }
    })
    // eslint-disable-next-line
  }, [socket])

  useEffect(() => {
    correctImages = correctImages.filter(el => !expiredMeme.includes(el));
    wrongImages = wrongImages.filter(el => !expiredMeme.includes(el));
  }, [expiredMeme])

  const getCorrectAnswerMeme = () => {
    let index = Math.floor(Math.random() * correctImages.length)
    let newMeme = correctImages[index]
    socket.emit("Add meme", newMeme)
    return newMeme
  }

  const getWrongAnswerMeme = () => {
    let index = Math.floor(Math.random() * wrongImages.length)
    let newMeme = wrongImages[index]
    socket.emit("Add meme", newMeme)
    return newMeme
  }

  const returnImg = () => {
    let res = ""
    if (type === "Pause") res = "https://i.ibb.co/Pj0qsJq/download-13.png"

    if (pauseFor === texts.correctAnswer) {
      res = getCorrectAnswerMeme()
    }

    if (pauseFor === texts.wrongAnswer) {
      res = getWrongAnswerMeme()
    }

    return res
  }

  return (
    <div>
      <h5>{addTextState}</h5>
      <ShowPictures question={{ image: returnImg2 }} />
    </div>
  )
}

export default ShowMeme