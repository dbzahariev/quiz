import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import buttonSound from "../../assets/audio/button-sound.mp3";
import ExitBtn from "../exitbtn"
import LeaderBoard from './leaderBoard';
import { saveGameInDb } from './leaderBoard'
import { Modal, Button, message } from 'antd';
import moment from 'moment';

const colors = [
  { name: "red", label: "Червено", color: 360 },
  { name: "blue", label: "Синьо", color: 230 },
  { name: "green", label: "Зелено", color: 125 },
  { name: "yellow", label: "Жълто", color: 255 },
  { name: "purple", label: "Ливаво", color: 200 },
  { name: "white", label: "Бяло", color: 0 },
  { name: "orange", label: "оранжево", color: 40 },
  { name: "lime", label: "Лайм", color: 72 },
  { name: "LightBlue", label: "Светло синьо", color: 180 },
  { name: "Pink", label: "Розово", color: 300 },
  { name: "black", label: "Черно", color: -1 },
]

const idButtons = { correct: "righty", wrong: "wrong" }

function timeConvert2(time) {
  if (time < 0) return "0s"
  let duration = moment.duration(time, "seconds")

  let seconds = duration.seconds()
  let minutes = duration.minutes()
  let hours = duration.hours()

  if (duration.asMilliseconds() < 0) {
    return { seconds, minutes, hours, fullString: "невалидно време" }
  }

  if (duration.asHours() >= 24) {
    return { seconds, minutes, hours, fullString: "над ден" }
  }

  let fullString = ""

  if (hours > 0) fullString = `${hours} ч., ${fullString}`
  if (minutes > 0) fullString = `${minutes} м., ${fullString}`
  if (seconds >= 0) fullString = `${fullString}${seconds} с.`
  // else fullString = `${fullString}${seconds}с.`
  // if (hours > 0) fullString = `${hours} ч., ${minutes} м., ${seconds} с.`
  // else if (minutes > 0) fullString = `${minutes} м., ${seconds} с.`
  // else fullString = `${seconds}с.`

  return { seconds, minutes, hours, fullString }
}

export function convertTime(time, retNum) {
  let res = Math.round(time / 100)
  if (retNum) return res
  else return timeConvert2(time / 100).fullString
}

class GameColorCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      colorText: colors[0].color,
      colorName: colors[0].name,
      buttonDisabled: true,
      hardMode: 1,
      timeInGame: 0,
      alertMsg: "",
      refreshLeaderBoard: 0
    };
    this.nextColor = this.nextColor.bind(this)
    this.checkYes = this.checkYes.bind(this)
    this.checkNo = this.checkNo.bind(this)
    this.keyHandler = this.keyHandler.bind(this)
    this.changeMode = this.changeMode.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.stopTimer = this.stopTimer.bind(this)
  }
  // const[messageApi, contextHolder] = message.useMessage();

  windowHeight = window.innerHeight;
  windowWidth = window.innerWidth;

  returnSelectedColorName = (mainColor) => {
    return `hsl(${mainColor}, 100%, ${mainColor === -1 ? 0 : mainColor === 0 ? 100 : 50}%)`
    // return colors.filter((el) => el.color === mainColor).slice()[0].name
  }


  returnSelectedColorLabel = (mainColor) => {
    return colors.filter((el) => el.name === mainColor).slice()[0].label
  }

  returnHarderColors = () => {
    let hardMode = this.state.hardMode
    let res = colors.slice()
    if (hardMode === 1) res = res.slice(0, 3)
    if (hardMode === 2) res = res.slice(0, 5)
    if (hardMode === 3) res = res.slice(0, 7)
    if (hardMode === 4) res = res.slice(0, 9)
    if (hardMode === 5) res = res.slice(0, 11)
    return res
  }

  nextColor = (event) => {
    if (event) {
      event.preventDefault()
    }

    let newColors = this.returnHarderColors()


    var itemColor = newColors[Math.floor(Math.random() * newColors.length)].color;
    var itemName = newColors[Math.floor(Math.random() * newColors.length)].name;
    this.setState({ colorText: itemColor, colorName: itemName })
  }

  checkYes = (event) => {
    event.preventDefault()
    colors.forEach((element) => {
      if (this.state.colorName === element.name && this.state.colorText === element.color) {
        this.setState({ score: this.state.score + 1 })
      }
    })
    this.nextColor(event)
    this.fixClickedClass(event)
  }

  checkNo = (event) => {
    event.preventDefault()
    colors.forEach((element) => {
      if (this.state.colorName === element.name && this.state.colorText !== element.color) {
        this.setState({ score: this.state.score + 1 })

      }
    })
    this.fixClickedClass(event)
    this.nextColor(event)
  }

  changeMode = (newMode) => {
    this.setState({ ...this.state, hardMode: newMode })
  }

  fixClickedClass = (event) => {
    if (event.target.classList) {
      event.target.classList.add("clicked")
    }
    if (document.getElementById("timeBar")) {
      document.getElementById("timeBar").classList.remove("timeBar")
    }
    setTimeout(() => {
      if (document.getElementsByClassName("clicked")[0]) {
        document.getElementsByClassName("clicked")[0].classList.remove("clicked")
      }
      if (document.getElementById("timeBar")) {
        document.getElementById("timeBar").classList.add("timeBar")
      }
    }, 200)
  }

  keyHandler = (e) => {
    //If Game started
    if (this.state.buttonDisabled === false) {
      if (["ArrowLeft", "a", ",", "<"].includes(e.key)) {
        document.getElementById(idButtons.correct).click()
      } else if (["ArrowRight", "d", ".", ">"].includes(e.key)) {
        document.getElementById(idButtons.wrong).click()
      }
    }
    else {
      if (["Enter", " "].includes(e.key)) {
        document.getElementById("startButton").click()
      }
    }
  }

  saveGame = async () => {
    return saveGameInDb({
      system: {
        game: "colorCheck"
      },
      data: {
        score: this.state.score,
        time: Math.round((this.state.timeInGame / 100)),
        hardMode: this.state.hardMode
      }
    })
  }

  startGame = (event) => {
    event.preventDefault()
    document.getElementById("startButton").style.display = "none"
    document.getElementById("timeBar").classList.add("timeBar")

    this.startTimer()

    this.setState({ buttonDisabled: false })

    setInterval(() => {
      let timeBar = document.getElementById("timeBar")
      let progressBar = document.getElementById("progressBar")
      let dif = timeBar.offsetWidth - progressBar.offsetWidth
      let end = dif > 0

      if (end) {
        this.setState({ timeInGame: this.state.timeInGame + 10, buttonDisabled: true }, async () => {
          document.getElementById("startButton").style.display = "block"
          // await this.saveGame()
          // console.log("after save")
          // this.saveGame().then((el) => {
          //   console.log("save", el.msg)
          // this.setState({ alertMsg: "ok" })
          // Alert({ type: "success" }, "hi")
          // alert(`Времето изтече!\nТочки: ${this.state.score}.\nВреме: ${this.convertTime(false)}.\nТрудност: ${this.state.hardMode}.\n${el.msg}`)

          timeBar.classList.remove("timeBar")
          this.stopTimer()

          let key222 = "2"

          message.open({
            key: key222,
            type: "loading",
            content: "Запазване",
          })
          this.saveGame().then((el) => {
            let type = el.msg === "New point is saved successfully!" ? "success" : "error"

            message.open({
              key: key222,
              type: type,
              content: <>
                <span style={{ paddingRight: "10px" }}>{`Времето изтече!`}</span>
                <p style={{ padding: 0, margin: 0 }}>{`Точки: ${this.state.score}`}</p>
                <p style={{ padding: 0, margin: 0 }}>{`Време: ${convertTime(this.state.timeInGame, false)}`}</p>
                <p style={{ padding: 0, margin: 0 }}>{`Трудност: ${this.state.hardMode}`}</p>
                {/* <p>{el.msg}</p> */}
              </>,
              duration: 2
            })
            this.setState({ score: 0, refreshLeaderBoard: this.state.refreshLeaderBoard + 1 })
          })
        })
      }
    }, 1);
  }

  handleQuitButtonClick = (e) => {
    document.getElementById('button-sound').play();
    if (window.confirm('Сигурен ли си, че искаш да излезеш от куиза?')) {
      this.props.history.push('/');
    }
  }

  styleButton = (mode) => {
    let res = {}
    if (mode === this.state.hardMode) {
      res.border = "3px solid black"
    }
    return res
  }

  returnAnimDur = () => {
    let res = 1.8
    const hardMode = this.state.hardMode;
    if (hardMode === 1) res = 1.8
    if (hardMode === 2) res = 1.5
    if (hardMode === 3) res = 1.3
    if (hardMode === 4) res = 1.0
    if (hardMode === 5) res = 0.5

    return `${res}s`
  }

  startTimer() {
    this.setState({
      timeInGame: 10
    })
    this.timer = setInterval(() => {
      this.setState({ timeInGame: this.state.timeInGame + 10 })
    }, 100);
  }

  stopTimer() {
    clearInterval(this.timer)
  }

  handleOk = () => {
    this.setState({ alertMsg: "" })
  }

  render() {
    document.onkeyup = this.keyHandler

    return <>
      <div className="full-game">
        <Modal title="Basic Modal" open={this.state.alertMsg !== ""} onOk={this.handleOk} onCancel={this.handleOk}
          footer={[
            <Button key="back" onClick={this.handleOk}>
              Ok
            </Button>]}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
        {/* {this.state.alertMsg !== "" ? <Alert
          message={this.state.alertMsg}
          type="success"
        /> : <p>not ok</p>} */}
        <LeaderBoard game="colorCheck" refreshLeaderBoard={this.state.refreshLeaderBoard} />
        {/* <Alert
          message="hi"
          type='success'
        /> */}
        <div className="games1">
          <audio id="button-sound" src={buttonSound}></audio>
          <div className="cont">
            <div id="progressBar" className="progressBar">
              <div id="timeBar" style={{ "--animate-dur": this.returnAnimDur() }}></div>
            </div>
            <div id="display">
              <h1 id="colors" style={{ color: this.returnSelectedColorName(this.state.colorText) }}>{this.returnSelectedColorLabel(this.state.colorName)}</h1>
            </div>
            <div id="score">
              <div id="scr">{this.state.score}</div>
            </div>
            <div className="controls">
              <button disabled={this.state.buttonDisabled} id={idButtons.correct} onClick={this.checkYes}>✓</button>
              <button disabled={this.state.buttonDisabled} id={idButtons.wrong} onClick={this.checkNo}>✕</button>
            </div>
            <div className="startButton">
              <button id="startButton" onClick={this.startGame}>Start</button>
            </div>


            <div className="hard-mode-container">
              <p>Трудност</p>
              <div className="hard-mode">
                <button style={this.styleButton(1)} onClick={() => this.changeMode(1)}>1</button>
                <button style={this.styleButton(2)} onClick={() => this.changeMode(2)}>2</button>
                <button style={this.styleButton(3)} onClick={() => this.changeMode(3)}>3</button>
                <button style={this.styleButton(4)} onClick={() => this.changeMode(4)}>4</button>
                <button style={this.styleButton(5)} onClick={() => this.changeMode(5)}>5</button>
              </div>
            </div>


            <div className='buttonContainer'>
              <ExitBtn />
            </div>
          </div>
        </div>
      </div>
    </>
  }
}

export default connect()(withRouter(GameColorCheck));