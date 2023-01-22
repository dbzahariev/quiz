import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import buttonSound from '../assets/audio/button-sound.mp3';

import io from "socket.io-client"
import { SOCKET_IO_SERVER } from "../Helper"

const socket = io.connect(SOCKET_IO_SERVER)

class ExitBtn extends Component {
  hadleQuitButtonClick = (e) => {
    e.preventDefault()
    document.getElementById('button-sound').play();
    if (window.confirm('Сигурен ли си, че искаш да излезеш от куиза?')) {
      socket.emit("SetCurrentQuestion", null)
      this.props.history.push('/');
    }
  }

  render() {
    return <div className='ExitBtn'>
      <audio id="button-sound" src={buttonSound}></audio>
      <button
        className='bbbbb'
        onClick={this.hadleQuitButtonClick}
      >
        Изход
      </button>
    </div>
  }
}

export default connect()(withRouter(ExitBtn));