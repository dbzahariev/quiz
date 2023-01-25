import React, { useState, useEffect } from 'react'
import io from "socket.io-client"
import { SOCKET_IO_SERVER } from "../../Helper"
import axios from "axios"
import ShowPictures from '../showPictures';

const socket = io.connect(SOCKET_IO_SERVER)

function HostOfQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null)
  const [allQuestions, setAllQuestions] = useState([])
  const [remainingQuestion, setRemainingQuestion] = useState(-1)

  const fixRemainQuestion = () => {
    axios.get('/api/all').then(data => {
      setRemainingQuestion(data.data.length)
    })
  }

  useEffect(() => {
    socket.emit("GetAllQuestion")
    socket.on("notification", (data) => {
      let msg = data.msg
      if ("set current question".indexOf(msg) !== -1) {
        setCurrentQuestion(data.currentQuestion.currentQuestion)
        setCurrentQuestionIndex(data.currentQuestion.currentQuestionIndex)
        setAllQuestions(data.currentQuestion.questionInQuiz)
        fixRemainQuestion()
      } else if ("Give you all Questions".indexOf(msg) !== -1) {
        // setAllQuestions(data.allQuestions)
      }
    })
    // eslint-disable-next-line
  }, [socket])

  const JSXQuestion = () => {
    if (currentQuestion === undefined || currentQuestion === null) return <div><h1>Няма започнат куиз</h1></div>
    let { question, optionA, optionB, optionC, optionD } = currentQuestion
    if (question === null) return <div></div>
    return (
      <div className="question">
        <p>Въпрос {currentQuestionIndex + 1} от {allQuestions.length}</p>
        <p>Оставащи общ брой въпроси: {remainingQuestion}</p>
        <p>Оставащи общ брой куизове: {Math.ceil(remainingQuestion / 15)}</p>
        <div style={{ display: "flex", justifyContent: "center", transition: "transform 0.25s ease 0s", transform: "scale(1)" }}></div>
        {currentQuestion.hints ?
          <p>Подсказка: {currentQuestion.hints}</p>
          : <></>}
        <ShowPictures question={currentQuestion} />
        <h5>{question}</h5>
        <div className="option-container">
          <p className="option" style={{ visibility: "visible" }}>
            <span className="opt">A</span>
            <span className="exactly-answer">{optionA}</span>
          </p>
          <p className="option" style={{ visibility: "visible" }}>
            <span className="opt">C</span>
            <span className="exactly-answer">{optionC}</span>
          </p>
        </div>
        <div className="option-container">
          <p className="option" style={{ visibility: "visible" }}>
            <span className="opt">B</span>
            <span className="exactly-answer">{optionB}</span>
          </p>
          <p className="option" style={{ visibility: "visible" }}>
            <span className="opt">D</span>
            <span className="exactly-answer">{optionD}</span>
          </p>
        </div>
      </div>
    )
  }


  return (
    <div>HostOfQuiz
      {JSXQuestion()}
    </div>
  )
}

export default HostOfQuiz