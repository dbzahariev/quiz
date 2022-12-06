import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from "axios";

class AddNewQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      question: 'Въпрос 111',
      optionA: "А1",
      optionB: "А2",
      optionC: "А3",
      optionD: "А4",
      answer: "А2",
      questionRowText: "many Questions",
      manyQuestionsRowText: "",
      allQuestions: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeManyQuestions = this.handleChangeManyQuestions.bind(this);
    this.handleChangeManyQuestions2 = this.handleChangeManyQuestions2.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearState = this.clearState.bind(this);
    this.prepareManyQuestions = this.prepareManyQuestions.bind(this);
  }

  componentDidMount() {
    this.clearState()
  }

  clearState() {
    this.setState({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: "",
      questionRowText: ""
    });
  }

  handleChange(event, type) {
    const target = event.target;
    this.setState({
      [target.name]: target.value
    });
  }

  handleChangeManyQuestions2(event) {
    let newValue = event.target.value;
    this.setState({
      manyQuestionsRowText: newValue
    });
  }

  handleChangeManyQuestions(event) {
    let newValue = event.target.value;
    this.setState({
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
    let answer2 = this.fixAnswerFromMany(newValue.split(";")[1].toString())
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

    console.log("b", arr2.length)
    if (arr2 === 1) return

    questionn.question = arr2[0][0] || ""
    questionn.optionA = arr2[1][0] || ""
    questionn.optionB = arr2[1][1] || ""
    questionn.optionC = arr2[1][2] || ""
    questionn.optionD = arr2[1][3] || ""
    questionn.answer = this.returnSelectedAns(answer2, questionn)

    this.setState(questionn)
  }

  fixAnswerFromMany(option) {
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

  sendOneQuestToDb(quest) {
    axios({
      method: "POST",
      data: quest,
      url: `/api`,
    })
      .then((res) => {
        alert("Успях")
        this.clearState()
      })
      .catch((err) => {
        alert("Грешка")
        console.error(err);
        return console.error(err);
      });
  }

  prepareManyQuestions() {
    console.log(this.state)
    let allQuestionsRowText = this.state.manyQuestionsRowText.split('\n')
    let allQuestionsArr = []


    // question: string;
    // optionA: string;
    // optionB: string;
    // optionC: string;
    // optionD: string;
    // answer: string;
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

        }
      } else {
        allQuestionsArr.push({ ...oneQuestion })
      }
    }
    this.setState({ allQuestions: allQuestionsArr })
    return allQuestionsArr
  }

  handleSubmit(event) {
    console.log(this.state)

    if (this.state === undefined) {
      return
    }

    if (this.state.question !== "") {
      this.sendOneQuestToDb(this.state)
    } else {
      let foo = this.prepareManyQuestions()
      foo.forEach(element => {
        this.sendOneQuestToDb(element)
      });
    }

    event.preventDefault();
  }

  returnSelectedAns(option, question = false) {
    let result = ""
    if (option === "A") {
      result = question?.optionA || this.state.optionA
    }
    if (option === "B") {
      result = question?.optionB || this.state.optionB
    }
    if (option === "C") {
      result = question?.optionC || this.state.optionC
    }
    if (option === "D") {
      result = question?.optionD || this.state.optionD
    }
    return result
  }

  setUserChoice(select) {
    this.setState({
      answer: this.returnSelectedAns(select.target.value),
    });
  }

  render() {
    return (
      <form style={{ paddingLeft: "10px", paddingTop: "20px", width: "80%" }} onSubmit={this.handleSubmit}>
        <div className="container" style={{ width: "100%" }}>
          <div className="row">
            <label>
              Въпрос:
              <input className='form-control' name="question" type="text" value={this.state.question} onChange={this.handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Отговор A:
              <input className='form-control' name="optionA" type="text" value={this.state.optionA} onChange={this.handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Отговор B:
              <input className='form-control' name="optionB" type="text" value={this.state.optionB} onChange={this.handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Отговор C:
              <input className='form-control' name="optionC" type="text" value={this.state.optionC} onChange={this.handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Отговор D:
              <input className='form-control' name="optionD" type="text" value={this.state.optionD} onChange={this.handleChange} />
            </label>
          </div>

          <div className="row">
            <label>
              Верен отговор: {this.state.answer}
              {/* <input className='form-control' name="answer" type="text" value={this.state.answer} onChange={this.handleChange} /> */}
            </label>
          </div>

          <div className="form-group">
            <label>Example select</label>
            <select onChange={(choice) => this.setUserChoice(choice)} className="form-control">
              <option>Отговор</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </div>

          <div className="form-group">
            <label>Example select</label>
            <textarea id="oneQuest" rows={5} cols={5} value={this.state.questionRowText} name="manyQuestions" onChange={this.handleChangeManyQuestions} />
          </div>

          <div className="form-group">
            <label>Example select</label>
            <textarea id="manyQuest" rows={5} cols={5} value={this.state.manyQuestionsRowText} name="manyQuestions" onChange={this.handleChangeManyQuestions2} />
          </div>

          <div className="row">
            <input type="submit" value="Submit" />
          </div>
        </div>
      </form>
    );
  }
}

AddNewQuestion.propTypes = {
};

const mapStateToProps = (state) => ({
  quiz: state.quiz
});

export default connect(mapStateToProps)(AddNewQuestion);