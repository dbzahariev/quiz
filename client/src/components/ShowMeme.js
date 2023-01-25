import React, { useState, useEffect } from 'react'
import ShowPictures from './showPictures'

import io from "socket.io-client"
import { SOCKET_IO_SERVER } from "../Helper"
import DragoV33 from '../assets/assetsForQuiz/Drago_v_33.mp4'
import OiRaicho from '../assets/assetsForQuiz/Oi_Raicho.mp4'

const socket = io.connect(SOCKET_IO_SERVER)

const texts = {
  correctAnswer: "correctAnswer",
  wrongAnswer: "wrongAnswer"
}

export let correctImages = [
  "https://i.ibb.co/LPts7cQ/Az-sam-maisor-na-kuizovete.png",
  "https://i.ibb.co/GdvnyH6/Daria-v-kolata.png",
  "https://i.ibb.co/CWrgvR7/Maikal-djaksan.png",
  "https://i.ibb.co/17P0pBp/Napravo-gi-umivam.png",
  "https://i.ibb.co/tqjw5nP/Petko.png"
]
export let wrongImages = [
  "https://i.ibb.co/gJ5SVXz/Pinokio-e-verniqt-otgovor.png",
  "https://i.ibb.co/85rHKDJ/Misal.png",
  "https://i.ibb.co/nwTH7mG/Unikalen-tapak-sym.png",
  "https://i.ibb.co/zRrh39Y/Drago-Kosmos.png",
  "https://i.ibb.co/F4w4rZh/Tri-svinski-glavi.png",
  "https://i.ibb.co/qFHngGq/Opitam-pak.png",
  "https://i.ibb.co/y0WG558/Pitanka.png",
  "https://i.ibb.co/3rMpKDZ/Ahilesov.png"
]

export let wrongVideos = [DragoV33, OiRaicho]

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
    wrongVideos = wrongVideos.filter(el => !expiredMeme.includes(el));
  }, [expiredMeme])

  const getCorrectAnswerMeme = () => {
    let index = Math.floor(Math.random() * correctImages.length)
    let newMeme = correctImages[index]
    socket.emit("Add meme", newMeme)
    return newMeme
  }

  const getWrongAnswerMeme = () => {
    let newMeme = undefined
    if (wrongImages.length >= 1) {
      let index = Math.floor(Math.random() * wrongImages.length)
      newMeme = wrongImages[index]
      socket.emit("Add meme", newMeme)
    }
    else {
      let index = Math.floor(Math.random() * wrongVideos.length)
      newMeme = wrongVideos[index]
      socket.emit("Add meme", newMeme)
    }
    return newMeme
  }

  const returnImg = () => {
    let res = ""
    if (type === "Pause") res = "https://i.ibb.co/Pj0qsJq/Bahti-tapite-vaprosi.png"

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
      {returnImg2 && returnImg2.indexOf("png") !== -1 ?
        <ShowPictures question={{ image: returnImg2 }} /> : <></>}
      {returnImg2 && returnImg2.length !== 0 && (returnImg2.indexOf("Drago_v_33") !== -1 || returnImg2.indexOf("Oi_Raicho") !== -1) ?
        <div style={{
          height: "300px", maxWidth: "90%", display: "flex", justifyContent: "center", marginBottom: "3%",
          justifyItems: "center", alignItems: "center",
          paddingLeft: "12%"
        }}>
          {returnImg2 && returnImg2.indexOf("Drago_v_33") !== -1 ?
            <video height="240" autoPlay controls>
              <source src={DragoV33} type="video/mp4" />
              Your browser does not support the video tag.
            </video> : <></>}
          {returnImg2 && returnImg2.indexOf("Oi_Raicho") !== -1 ?
            <video height="240" autoPlay controls>
              <source src={OiRaicho} type="video/mp4" />
              Your browser does not support the video tag.
            </video> : <></>}
        </div>
        : <></>}
    </div>
  )
}

export default ShowMeme