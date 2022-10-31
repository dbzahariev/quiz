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
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearState = this.clearState.bind(this);
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
    });
  }

  handleChange(event, type) {
    const target = event.target;
    this.setState({
      [target.name]: target.value
    });
  }

  handleSubmit(event) {
    axios({
      method: "POST",
      data: this.state,
      withCredentials: true,
      url: `/api`,
    })
      .then((res) => {
        alert("Успях")
        console.log('успях')
        this.clearState()
      })
      .catch((err) => {
        alert("Грешка")
        console.error(err);
        return console.error(err);
      });
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Въпрос:
          <input name="question" type="text" value={this.state.question} onChange={this.handleChange} />
        </label>
        <br />

        <label>
          Отговор A:
          <input name="optionA" type="text" value={this.state.optionA} onChange={this.handleChange} />
        </label>
        <br />

        <label>
          Отговор B:
          <input name="optionB" type="text" value={this.state.optionB} onChange={this.handleChange} />
        </label>
        <br />

        <label>
          Отговор C:
          <input name="optionC" type="text" value={this.state.optionC} onChange={this.handleChange} />
        </label>
        <br />

        <label>
          Отговор D:
          <input name="optionD" type="text" value={this.state.optionD} onChange={this.handleChange} />
        </label>
        <br />

        <label>
          Верен отговор:
          <input name="answer" type="text" value={this.state.answer} onChange={this.handleChange} />
        </label>
        <br />

        <input type="submit" value="Submit" />
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