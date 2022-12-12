import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { clearQuizStats } from '../actions/quizActions';

class ShowPictures extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transform: "scale(1)"
    };
    this.toBigImg = this.toBigImg.bind(this)
  }

  toBigImg = () => {
    const fixImg = () => {
      let img = document.getElementById("img1");

      img.style.position = "absolute"
      img.style.top = "8%"
    }

    const resetImg = () => {
      let img = document.getElementById("img1");

      img.style.position = ""
      img.style.top = ""
    }

    if (this.state.transform === "scale(1)") {
      this.setState({ transform: "scale(2.5)" })
      fixImg()
    }
    else {
      this.setState({ transform: "scale(1)" })
      resetImg()
    }
  }

  render() {
    return <div style={{
      display: "flex", justifyContent: "center", transition: "transform 0.25s",
      transform: this.state.transform,
    }}>
      {this.props.question.img !== undefined ?
        <div style={{ height: "300px", display: "flex", justifyContent: "center", marginBottom: "3%", }}>
          <img id="img1" onClick={this.toBigImg} style={{ height: "100%", cursor: "pointer", border: "1px solid black" }} src={this.props.question.img} alt="pictures"></img>
        </div>
        : <></>}
    </div>
  }
}


ShowPictures.propTypes = {
  question: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  quiz: state.quiz
});

export default connect(mapStateToProps, { clearQuizStats })(ShowPictures);