import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import buttonSound from '../../assets/audio/button-sound.mp3';
import ExitBtn from "../exitbtn"
import LeaderBoard from './leaderBoard';

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

const idButtons = { corect: "righty", wrong: "wrong" }

class GameColorcheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      colorText: colors[0].color,
      colorName: colors[0].name,
      btnsDisabled: true,
      hardMode: 1
    };
    this.nextColor = this.nextColor.bind(this)
    this.checkYes = this.checkYes.bind(this)
    this.checkNo = this.checkNo.bind(this)
    this.keyHandler = this.keyHandler.bind(this)
    this.changeMode = this.changeMode.bind(this)
  }

  hheight = window.innerHeight;
  wwidth = window.innerWidth;

  returnSelectedColorName = (mainColor) => {
    let kk = mainColor
    return `hsl(${kk}, 100%, ${kk === -1 ? 0 : kk === 0 ? 100 : 50}%)`
    // return colors.filter((el) => el.color === mainColor).slice()[0].name
  }

  returnSelectedColorLabel = (mainColor) => {
    return colors.filter((el) => el.name === mainColor).slice()[0].label
  }

  returnHarderColors = () => {
    let harMode = this.state.hardMode
    let res = colors.slice()
    if (harMode === 1) res = res.slice(0, 3)
    if (harMode === 2) res = res.slice(0, 5)
    if (harMode === 3) res = res.slice(0, 7)
    if (harMode === 4) res = res.slice(0, 9)
    if (harMode === 5) res = res.slice(0, 11)
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
    this.fixClickedClas(event)
  }

  checkNo = (event) => {
    event.preventDefault()
    colors.forEach((element) => {
      if (this.state.colorName === element.name && this.state.colorText !== element.color) {
        this.setState({ score: this.state.score + 1 })

      }
    })
    this.fixClickedClas(event)
    this.nextColor(event)
  }

  changeMode = (newMode) => {
    this.setState({ ...this.state, hardMode: newMode })
  }

  fixClickedClas = (event) => {
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
    if (this.state.btnsDisabled === false) {
      if (["ArrowLeft", "a", ",", "<"].includes(e.key)) {
        document.getElementById(idButtons.corect).click()
      } else if (["ArrowRight", "d", ".", ">"].includes(e.key)) {
        document.getElementById(idButtons.wrong).click()
      }
    }
    else {
      if (["Enter", " "].includes(e.key)) {
        document.getElementById("startBtn").click()
      }
    }
  }

  startGame = (event) => {
    event.preventDefault()
    document.getElementById("startBtn").style.display = "none"
    document.getElementById("timeBar").classList.add("timeBar")

    this.setState({ btnsDisabled: false })

    setInterval(() => {
      let timeBar = document.getElementById("timeBar")
      let progresBar = document.getElementById("pgrBar")
      let dif = timeBar.offsetWidth - progresBar.offsetWidth
      let end = dif > 0

      if (end) {
        document.getElementById("startBtn").style.display = "block"
        alert(`Timeout, your score is ${this.state.score}`)
        this.setState({ score: 0, btnsDisabled: true })
        timeBar.classList.remove("timeBar")
      }
    }, 1);
  }

  hadleQuitButtonClick = (e) => {
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

  render() {
    document.onkeyup = this.keyHandler

    return <>
      <div className="full-game">
        <LeaderBoard game="colorCheck" />
        <div className="games1">
          <audio id="button-sound" src={buttonSound}></audio>
          <div className="cont">
            <div id="pgrBar" className="prgBar">
              <div id="timeBar"></div>
            </div>
            <div id="display">
              <h1 id="colors" style={{ color: this.returnSelectedColorName(this.state.colorText) }}>{this.returnSelectedColorLabel(this.state.colorName)}</h1>
            </div>
            <div id="score">
              <div id="scr">{this.state.score}</div>
            </div>
            <div className="controls">
              <button disabled={this.state.btnsDisabled} id={idButtons.corect} onClick={this.checkYes}>✓</button>
              <button disabled={this.state.btnsDisabled} id={idButtons.wrong} onClick={this.checkNo}>✕</button>
            </div>
            <div className="startBtn">
              <button id="startBtn" onClick={this.startGame}>Start</button>
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

export default connect()(withRouter(GameColorcheck));