import React, { useState, useEffect } from 'react'
import axios from "axios";

import io from "socket.io-client"
//https://ramsess-quiz.onrender.com
const socket = io.connect("http://ramsess-quiz-be.onrender.com:10000")
// const socket = io.connect("https://ramsess-quiz.onrender.com")
// const socket = io.connect("https://ramsess-quiz.onrender.com/api")
// https://ramsess-quiz.onrender.com/api/getFreeQuiz

// const socket = io("https://ramsess-quiz.onrender.com")
function AddNewQuestion() {
  const [state, setState] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: "",
    questionRowText: "",
    manyQuestionsRowText: ""
  })

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("rec", data)
    })
    retAxiosLocal()
    // eslint-disable-next-line
  }, [socket])

  const retAxiosLocal = () => {
    let res = window.location.href.toString().replace("addNewQuestion", "")
    console.log(res)
  }

  const sendMsg = () => {
    socket.emit("send_message", { message: "hi from ui", time: (new Date()).toISOString() })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (state.question !== "") {
      sendOneQuestToDb(state)
    } else {
      prepManyQuestion222();
    }
  }

  const prepManyQuestion222 = async () => {
    let allQuestions = prepareManyQuestions();

    // eslint-disable-next-line
    for (let element of allQuestions) {
      let imgIndex = element.question.indexOf("img")

      if (imgIndex === -1) {
      } else {
        element.question = element.question.slice(5)
        element.image = "Insert"
      }
      sendOneQuestToDb(element)
    }
  }

  const sendOneQuestToDb = async (quest) => {
    return await axios({
      method: "POST",
      data: quest,
      url: `/api`,
    }).then((res) => {
      console.log(res.data)
      clearState()
      return res
    }).catch((err) => {
      alert("Грешка!!!", JSON.stringify(quest))
      console.error(err);
      return console.error(err);
    });
  }

  const clearState = () => {
    let foo = {
      ...state,
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: "",
      questionRowText: "",
      manyQuestionsRowText: ""
    }
    setState(foo);
  }

  const prepareManyQuestions = () => {
    let allQuestionsRowText = state.manyQuestionsRowText.split('\n')
    let allQuestionsArr = []

    let oneQuestion = {
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: ""
    }
    for (let i = 0; i <= allQuestionsRowText.length; i++) {
      let gg = allQuestionsRowText[i]
      let ffvv = i % 6
      if (ffvv === 0) {
        oneQuestion.question = gg
      } else if (ffvv === 1) {
        oneQuestion.optionA = gg
      } else if (ffvv === 2) {
        oneQuestion.optionB = gg
      } else if (ffvv === 3) {
        oneQuestion.optionC = gg
      } else if (ffvv === 4) {
        let arr = gg.split(";")
        oneQuestion.optionD = arr[0]
        if (arr[1] === "a") {
          oneQuestion.answer = oneQuestion.optionA
        } else if (arr[1] === "b") {
          oneQuestion.answer = oneQuestion.optionB
        } else if (arr[1] === "c") {
          oneQuestion.answer = oneQuestion.optionC
        } else if (arr[1] === "d") {
          oneQuestion.answer = oneQuestion.optionD
        } else {
          oneQuestion.answer = ""
        }
      } else {
        allQuestionsArr.push({ ...oneQuestion })
      }
    }
    setState({
      ...state,
      allQuestions: allQuestionsArr
    })
    return allQuestionsArr
  }


  const handleChange = (event, type) => {
    const target = event.target;

    setState({
      ...state,
      [target.name]: target.value
    });
  }

  const returnSelectedAns = (option, question = false) => {
    let result = ""
    if (option === "A") {
      result = question?.optionA || state.optionA
    }
    if (option === "B") {
      result = question?.optionB || state.optionB
    }
    if (option === "C") {
      result = question?.optionC || state.optionC
    }
    if (option === "D") {
      result = question?.optionD || state.optionD
    }
    return result
  }

  const setUserChoice = (select) => {
    setState({
      ...state,
      answer: returnSelectedAns(select.target.value),
    });
  }


  const handleChangeManyQuestions2 = (event) => {
    let newValue = event.target.value;
    setState({
      ...state,
      manyQuestionsRowText: newValue
    });
  }

  const handleChangeManyQuestions = (event) => {
    let newValue = event.target.value;
    setState({
      ...state,
      questionRowText: newValue
    });
    let questionn = {
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: "",
    }

    if (newValue.indexOf("\n")) {
      newValue = newValue.split("\n")[0]
    }

    if (newValue.indexOf("/") === -1) return
    let arr = newValue.split("/")
    if (newValue.indexOf(";") === -1) return
    let answer2 = fixAnswerFromMany(newValue.split(";")[1].toString())
    let arr2 = []

    for (let i = 0; i < arr.length; i++) {
      let optionFromText = arr[i].split("\\")
      if (i === 1) {
        if (optionFromText[3].indexOf(";") > -1) {
          optionFromText[3] = optionFromText[3].split(";")[0]
        }
      }
      arr2.push(optionFromText)
    }

    if (arr2 === 1) return

    questionn.question = arr2[0][0] || ""
    questionn.optionA = arr2[1][0] || ""
    questionn.optionB = arr2[1][1] || ""
    questionn.optionC = arr2[1][2] || ""
    questionn.optionD = arr2[1][3] || ""
    questionn.answer = returnSelectedAns(answer2, questionn)

    setState({
      ...state,
      ...questionn
    })
  }

  const fixAnswerFromMany = (option) => {
    let result = ""
    if (option === "А" || option === "а" || option === "a") {
      result = "A"
    }
    if (option === "Б" || option === "б" || option === "b") {
      result = "B"
    }
    if (option === "В" || option === "в" || option === "c") {
      result = "C"
    }
    if (option === "Г" || option === "г" || option === "d") {
      result = "D"
    }
    return result
  }


  return (
    <>
      <button onClick={sendMsg}>Send MSG</button>
      <form style={{ paddingLeft: "10px", paddingTop: "20px", width: "80%" }}
        onSubmit={handleSubmit}
      >
        <div className="container" style={{ width: "100%" }}>
          <div className="row">
            <label>
              Въпрос:
              <input className='form-control' name="question" type="text" value={state.question} onChange={handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Отговор A:
              <input className='form-control' name="optionA" type="text" value={state.optionA} onChange={handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Отговор B:
              <input className='form-control' name="optionB" type="text" value={state.optionB} onChange={handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Отговор C:
              <input className='form-control' name="optionC" type="text" value={state.optionC} onChange={handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Отговор D:
              <input className='form-control' name="optionD" type="text" value={state.optionD} onChange={handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Верен отговор: {state.answer}
            </label>
          </div>

          <div className="form-group">
            <label>Example select</label>
            <select onChange={(choice) => setUserChoice(choice)} className="form-control">
              <option>Отговор</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </div>

          <div className="form-group">
            <label>Example select</label>
            <textarea id="oneQuest" rows={5} cols={5} value={state.questionRowText} name="manyQuestions" onChange={handleChangeManyQuestions} />
          </div>

          <div className="form-group">
            <label>Example select</label>
            <textarea id="manyQuest" rows={5} cols={5} value={state.manyQuestionsRowText} name="manyQuestions" onChange={handleChangeManyQuestions2} />
          </div>

          <div className="row">
            <input type="submit" value="Submit" />
          </div>
        </div>
      </form>
    </>
  )
}

export default AddNewQuestion
