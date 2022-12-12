import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import buttonSound from '../../assets/audio/button-sound.mp3';
import ExitBtn from "../exitbtn"

const colors = [
  { name: "red", color: 360 },
  { name: "blue", color: 230 },
  { name: "green", color: 125 },
  { name: "yellow", color: 255 },
  { name: "purple", color: 200 },
]

const idButtons = { corect: "righty", wrong: "wrong" }

class GameColorcheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      colorText: colors[0].color,
      colorName: colors[0].name,
      btnsDisabled: true
    };
    this.toBigImg = this.toBigImg.bind(this)
    this.nextColor = this.nextColor.bind(this)
    this.checkYes = this.checkYes.bind(this)
    this.checkNo = this.checkNo.bind(this)
    this.keyHandler = this.keyHandler.bind(this)
    // this.hadleQuitButtonClick = this.hadleQuitButtonClick(this)
  }

  hheight = window.innerHeight;
  wwidth = window.innerWidth;

  returnColor = (mainColor) => {
    let res = ""
    colors.forEach(el => {
      if (mainColor === el.color) {
        res = el.name
      }
    })
    return res
    // return `hsl(${mainColor}, 100%, 50%)`
  }

  toBigImg = () => {

  }


  nextColor = (event) => {
    if (event) {
      event.preventDefault()
    }
    var itemColor = colors[Math.floor(Math.random() * colors.length)].color;
    var itemName = colors[Math.floor(Math.random() * colors.length)].name;
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
    if (this.state.btnsDisabled === false) {
      if (["ArrowLeft", "a", ",", "<"].includes(e.key)) {
        document.getElementById(idButtons.corect).click()
      } else if (["ArrowRight", "d", ".", ">"].includes(e.key)) {
        document.getElementById(idButtons.wrong).click()
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

  render() {
    document.onkeydown = this.keyHandler

    return <div className="games1">
      <audio id="button-sound" src={buttonSound}></audio>
      <div className="cont">
        <div id="pgrBar" className="prgBar">
          <div id="timeBar"></div>
        </div>
        <div id="display">
          {/* <h1 id="colors"> </h1> */}
          <h1 id="colors" style={{ color: this.returnColor(this.state.colorText) }}>{this.state.colorName}</h1>
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
        <div className='buttonContainer'>
          <ExitBtn />
        </div>
      </div>
    </div>
  }
}

export default connect()(withRouter(GameColorcheck));