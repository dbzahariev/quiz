import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import M from 'materialize-css';
import classnames from 'classnames';
import { Helmet } from 'react-helmet';
import axios from 'axios'

import Loader from '../common/Loader';

import { getFreeQuestions, endFreeQuiz } from '../../actions/quizActions';

import isEmpty from '../../validation/is-empty';

import correctNotification from '../../assets/audio/correct-answer.mp3';
import wrongNotification from '../../assets/audio/wrong-answer.mp3';
import ShowPictures from '../showPictures';
import ExitBtn from "../exitbtn"
import io from "socket.io-client"
import { SOCKET_IO_SERVER } from "../../Helper"
import ShowMeme from '../ShowMeme';

class Play extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: '',
            questions: [],
            currentQuestion: {},
            nextQuestion: {},
            previousQuestion: {},
            answer: '',
            numberOfQuestions: 0,
            numberOfAnsweredQuestions: 0,
            currentQuestionIndex: 0,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            hints: 10,
            fiftyFifty: 2,
            usedFiftyFifty: false,
            loading: false,
            previousButtonDisabled: true,
            nextButtonDisabled: false,
            previousRandomNumbers: [],
            time: {},
            pauseTime: 0,
            pauseTiger: false,
            pauseFor: "",

            socket: io.connect(SOCKET_IO_SERVER)
        };
        this.interval = null
        this.intervalPause = null
        this.pause = this.pause.bind(this)
        this.onMouseEnter = this.onMouseEnter.bind(this)
        this.onMouseLeave = this.onMouseLeave.bind(this)
    }

    componentDidMount() {
        this.props.getFreeQuestions();
        this.setState({
            loading: true
        });
        this.startTimer();
        this.state.socket.on("notification", (data) => {
            // console.log("not2", data)
        })
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        clearInterval(this.intervalPause);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (!isEmpty(nextProps.quiz)) {
            if (!isEmpty(nextProps.quiz.questions)) {
                this.state.socket.emit("AddQuestionAll", nextProps.quiz.questions)
            }
            this.setState({
                questions: nextProps.quiz.questions,
                type: nextProps.quiz.type,
                numberOfQuestions: nextProps.quiz.numberOfQuestions,
                loading: false
            }, () => {
                this.displayQuestion(this.state.questions);
                this.handleDisableButton();
            });
        }
    }

    handleDisableButton = () => {
        if (this.state.previousQuestion === undefined || this.state.currentQuestionIndex === 0) {
            this.setState({
                previousButtonDisabled: true
            });
        } else {
            this.setState({
                previousButtonDisabled: false
            });
        }

        if (this.state.nextQuestion === undefined || this.state.currentQuestionIndex + 1 === this.state.numberOfQuestions) {
            this.setState({
                nextButtonDisabled: true
            });
        } else {
            this.setState({
                nextButtonDisabled: false
            });
        }
    }

    displayQuestion(questions = this.state.questions, currentQuestion, nextQuestion, previousQuestion) {
        let { currentQuestionIndex } = this.state;
        if (!isEmpty(this.state.questions)) {
            questions = this.state.questions;
            currentQuestion = questions[currentQuestionIndex];
            nextQuestion = questions[currentQuestionIndex + 1];
            previousQuestion = questions[currentQuestionIndex - 1];
            const answer = currentQuestion.answer;
            this.state.socket.emit("SetCurrentQuestion", { currentQuestion, currentQuestionIndex, questionInQuiz: this.state.questions, numberOfQuestions: this.state.numberOfQuestions })
            this.setState({
                currentQuestion,
                nextQuestion,
                previousQuestion,
                answer,
                previousRandomNumbers: []
            }, () => {
                this.showOptions();
                this.handleDisableButton();
            });
        }
    }

    handleOptionClick = (e) => {
        let el = ""
        if (e.target.children[1] !== undefined) {
            el = e.target.children[1].innerHTML
        }
        if (el === "") {
            if (e.target.parentNode.children[1].innerHTML !== undefined) {
                el = e.target.parentNode.children[1].innerHTML
            }
        }
        if (el === "") {
            debugger
        }
        if (el.toLowerCase() === this.state.answer.toLowerCase()) {
            document.getElementById('correct-audio').play();
            setTimeout(() => {
                this.correctAnswer();
            }, 500);
        } else {
            document.getElementById('wrong-audio').play();
            setTimeout(() => {
                this.wrongAnswer();
            }, 500);
        }

        if (this.state.numberOfQuestions === 0) {
            const questionsArray = Object.keys(this.state.questions).map(i => this.state.questions[i]);
            this.setState({
                numberOfQuestions: questionsArray.length
            });
        }
    }

    handleNextButtonClick = (e) => {
        if (!this.state.nextButtonDisabled) {
            this.playButtonSound();
            if (this.state.nextQuestion !== undefined) {
                this.setState((prevState) => ({
                    currentQuestionIndex: prevState.currentQuestionIndex + 1
                }), () => {
                    this.displayQuestion(this.state.questions, this.state.currentQuestion, this.state.nextQuestion, this.state.previousQuestion);
                });
            }
        }
    };

    handlePreviousButtonClick = (e) => {
        if (!this.state.previousButtonDisabled) {
            this.playButtonSound();
            if (this.state.previousQuestion !== undefined) {
                this.setState((prevState) => ({
                    currentQuestionIndex: prevState.currentQuestionIndex - 1
                }), () => {
                    this.displayQuestion(this.state.questions, this.state.currentQuestion, this.state.nextQuestion, this.state.previousQuestion);
                });
            }
        }
    }

    handleLifeline = (e) => {
        switch (e.target.id) {
            case 'fiftyfifty':
                if (this.state.fiftyFifty > 0 && this.state.usedFiftyFifty === false) {
                    this.handleFiftyFifty();
                    this.setState((prevState) => ({
                        fiftyFifty: prevState.fiftyFifty - 1
                    }));
                }
                break;

            default:
                break;
        }
    }

    handleFiftyFifty = () => {
        const options = document.querySelectorAll('.option');
        const randomNumbers = [];
        let indexOfAnswer;

        options.forEach((option, index) => {
            if (option.innerHTML.toLowerCase() === this.state.answer.toLowerCase()) {
                indexOfAnswer = index;
            }
        });

        let count = 0;
        do {
            const randomNumber = Math.round(Math.random() * 3);
            if (randomNumber !== indexOfAnswer) {
                if (randomNumbers.length < 2) {
                    if (!randomNumbers.includes(randomNumber) && !randomNumbers.includes(indexOfAnswer)) {
                        randomNumbers.push(randomNumber);
                        count++;
                    } else {
                        while (true) {
                            const newRandomNumber = Math.round(Math.random() * 3);
                            if (!randomNumbers.includes(newRandomNumber) && newRandomNumber !== indexOfAnswer) {
                                randomNumbers.push(newRandomNumber);
                                count++;
                                break;
                            }
                        }
                    }
                }
            }
        } while (count < 2);
        options.forEach((option, index) => {
            if (randomNumbers.includes(index)) {
                option.style.visibility = 'hidden';
            }
        });
        this.setState({
            usedFiftyFifty: true
        });
    }

    handleHints = () => {
        if (this.state.hints > 0) {
            let options = Array.from(document.querySelectorAll('.option'));
            let indexOfAnswer;


            options.forEach((option, index) => {
                if (option.innerHTML.toLowerCase() === this.state.answer.toLowerCase()) {
                    indexOfAnswer = index;
                }
            });

            while (true) {
                const randomNumber = Math.round(Math.random() * 3);
                if (randomNumber !== indexOfAnswer && !this.state.previousRandomNumbers.includes(randomNumber)) {
                    options.forEach((option, index) => {
                        if (index === randomNumber) {
                            option.style.visibility = 'hidden';
                            this.setState((prevState) => ({
                                hints: prevState.hints - 1,
                                previousRandomNumbers: prevState.previousRandomNumbers.concat(randomNumber)
                            }));
                        }
                    });
                    break;
                }

                if (this.state.previousRandomNumbers.length >= 3) break;
            }
        }
    }

    showOptions = () => {
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.style.visibility = 'visible';
        });
        this.setState({
            usedFiftyFifty: false
        });
    };

    deleteQuestion = () => {
        let newQuest = {
            question: this.state.currentQuestion.question,
            optionA: this.state.currentQuestion.optionA,
            optionB: this.state.currentQuestion.optionB,
            optionC: this.state.currentQuestion.optionC,
            optionD: this.state.currentQuestion.optionD,
            answer: this.state.currentQuestion.answer,
            delete: true
        }

        axios.put(`/api/updateQuestion/${this.state.currentQuestion._id}`, newQuest)
            .then(res => {
                console.log(res.data.message)
            })
            .catch(err => {
                console.log(err);
            });
    }

    correctAnswer = () => {
        M.toast({
            html: 'Верен отговор!',
            classes: 'toast-valid',
            displayLength: 1500
        });
        this.deleteQuestion()
        this.setState((prevState) => ({
            score: prevState.score + 1,
            correctAnswers: prevState.correctAnswers + 1,
            currentQuestionIndex: prevState.currentQuestionIndex + 1,
            numberOfAnsweredQuestions: prevState.numberOfAnsweredQuestions + 1,
            pauseFor: "correctAnswer",
            pauseTiger: true
        }), () => {
            if (this.state.nextQuestion === undefined) {
                this.endGame();
            } else {
                this.displayQuestion(this.state.questions, this.state.currentQuestion, this.state.nextQuestion, this.state.previousQuestion);
            }
        });
    }

    wrongAnswer = () => {
        navigator.vibrate(1000);
        M.toast({
            html: 'Грешен отговор!',
            classes: 'toast-invalid',
            displayLength: 1500
        });
        this.setState((prevState) => ({
            wrongAnswers: prevState.wrongAnswers + 1,
            currentQuestionIndex: prevState.currentQuestionIndex + 1,
            numberOfAnsweredQuestions: prevState.numberOfAnsweredQuestions + 1,
            pauseFor: "wrongAnswer",
            pauseTiger: true
        }), () => {
            if (this.state.nextQuestion === undefined) {
                this.endGame();
            } else {
                this.displayQuestion(this.state.questions, this.state.currentQuestion, this.state.nextQuestion, this.state.previousQuestion);
            }
        });
    }

    endGame = () => {
        alert('Край на куиза!');
        const quizData = {
            score: this.state.score,
            type: this.state.type,
            numberOfQuestions: this.state.numberOfQuestions,
            numberOfAnsweredQuestions: this.state.numberOfAnsweredQuestions,
            correctAnswers: this.state.correctAnswers,
            wrongAnswers: this.state.wrongAnswers,
            usedHints: 0 - this.state.hints,
            usedfiftyFifty: 2 - this.state.fiftyFifty,
        };

        this.props.endFreeQuiz(quizData, this.props.history)
    }

    startTimer = () => {
        // const countDownTime = Date.now() + 900000;
        const countDownTime = Date.now() + 1800000;
        this.interval = setInterval(() => {
            const now = new Date();
            const distance = (countDownTime - now) + this.state.pauseTime * 1000;

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance < 0) {
                clearInterval(this.interval);
                this.setState({
                    ...this.state,
                    time: {
                        minutes: 0,
                        seconds: 0
                    }
                }, () => {
                    this.endGame();
                });
            } else {
                this.setState({
                    ...this.state,
                    time: {
                        seconds,
                        minutes,
                        distance
                    }
                });
            }
        }, 1000);
    }

    playButtonSound = () => {
        document.getElementById('button-sound').play();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.pauseTiger !== this.state.pauseTiger) {
            let isPause = this.state.pauseTiger
            if (isPause) {
                this.intervalPause = setInterval(() => {
                    this.setState({
                        ...this.state,
                        pauseTime: this.state.pauseTime + 1
                    })
                }, 1000);
            }
            else {
                clearInterval(this.intervalPause)
            }
        }

    }

    pause() {
        this.setState({ pauseTiger: !this.state.pauseTiger, pauseFor: "" })
    }

    checkAnswer(ans) {
        let { answer, optionA, optionB, optionC, optionD } = this.state.currentQuestion
        if (answer === undefined) return false
        let isA = answer === optionA
        let isB = answer === optionB
        let isC = answer === optionC
        let isD = answer === optionD

        if (isA && ans === "A") return true
        if (isB && ans === "B") return true
        if (isC && ans === "C") return true
        if (isD && ans === "D") return true
        return false
    }

    onMouseLeave(e) {
        if (e !== undefined && e.target !== undefined && e.target.children !== undefined && e.target.children[0] !== undefined && e.target.children[0].innerHTML !== undefined) {
            let hoveredOptions = e.target.children[0].innerHTML
            this.state.socket.emit("OffHover", hoveredOptions)
        }
    }

    onMouseEnter(e) {
        if (e !== undefined && e.target !== undefined && e.target.children !== undefined && e.target.children[0] !== undefined && e.target.children[0].innerHTML !== undefined) {
            let hoveredOptions = e.target.children[0].innerHTML
            if (this && this.state && this.state.socket) {
                this.state.socket.emit("OnHover", hoveredOptions)
            }
        }
    }

    render() {
        const { currentQuestion, questions, loading, time } = this.state;

        let quizContent;

        if (isEmpty(questions) || loading === true) {
            quizContent = <Loader />;
        } else {
            quizContent = (
                <Fragment>
                    <Helmet><title>Куиз</title></Helmet>
                    <Fragment>
                        <audio id="correct-audio" src={correctNotification}></audio>
                        <audio id="wrong-audio" src={wrongNotification}></audio>
                    </Fragment>
                    <div className="question">
                        <div className="lifeline-container">
                            <p>
                                <span
                                    onClick={this.handleLifeline}
                                    id="fiftyfifty"
                                    className={classnames('mdi mdi-set-center mdi-24px lifeline-icon', {
                                        'lifeline-icon-empty': this.state.fiftyFifty === 0
                                    })}>
                                    <span className="lifeline">{this.state.fiftyFifty}</span>
                                </span>
                            </p>
                            {/* Hints start */}
                            <p>
                                {this.state.hints > 0
                                    ?
                                    <span
                                        onClick={this.handleHints}
                                        id="hints"
                                        className={classnames('mdi mdi-lightbulb-on mdi-24px lifeline-icon', {
                                            'lifeline-icon-empty': this.state.hints === 0
                                        })}>
                                        <span className="lifeline">{this.state.hints}</span>
                                    </span>
                                    :
                                    <span
                                        onClick={this.handleLifeline}
                                        id="hints"
                                        className={classnames('mdi mdi-lightbulb-on-outline mdi-24px lifeline-icon', {
                                            'lifeline-icon-empty': this.state.hints === 0
                                        })}>
                                        <span className="lifeline">{this.state.hints}</span>
                                    </span>
                                }
                            </p>
                            {/* Hints end */}
                        </div>
                        <p>
                            {/* Number Question start */}
                            <span>{this.state.currentQuestionIndex + 1} от {this.state.numberOfQuestions}</span>
                            {/* Number Question end */}
                            <button style={{ border: "0px", backgroundColor: "#f8f8f8" }} className={classnames('right valid', {
                                'warning': time.distance <= 120000,
                                'invalid': time.distance < 30000
                            })} onClick={this.pause}>
                                <span className="mdi mdi-clock-outline mdi-24px" style={{ position: 'relative', top: '2px' }}>
                                </span>
                                {time.minutes}:{time.seconds}
                            </button>
                        </p>

                        {this.state.pauseTiger ?
                            <div>
                                <ShowMeme type="Pause" pauseFor={this.state.pauseFor} addText="Пауза" />
                            </div> :
                            <>
                                {currentQuestion.question !== undefined ? <ShowPictures question={currentQuestion} /> : <></>}
                                <h5>{currentQuestion.question}</h5>
                                <div className="option-container">
                                    <p onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onClick={this.handleOptionClick} className="option"><span style={{ backgroundColor: this.checkAnswer("A") ? "" : "" }} className="opt">A</span><span className="exactly-answer">{currentQuestion.optionA}</span></p>
                                    <p onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onClick={this.handleOptionClick} className="option"><span style={{ backgroundColor: this.checkAnswer("C") ? "" : "" }} className="opt">C</span><span className="exactly-answer">{currentQuestion.optionC}</span></p>
                                </div>
                                <div className="option-container">
                                    <p onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onClick={this.handleOptionClick} className="option"><span style={{ backgroundColor: this.checkAnswer("B") ? "" : "" }} className="opt">B</span><span className="exactly-answer">{currentQuestion.optionB}</span></p>
                                    <p onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onClick={this.handleOptionClick} className="option"><span style={{ backgroundColor: this.checkAnswer("D") ? "" : "" }} className="opt">D</span><span className="exactly-answer">{currentQuestion.optionD}</span></p>
                                </div>
                            </>}
                    </div>

                    <div className="buttonContainer">
                        <button
                            className={classnames('', { 'disable': this.state.previousButtonDisabled })}
                            onClick={this.handlePreviousButtonClick}>
                            <span
                                style={{ marginRight: '5px' }}
                                className="mdi mdi-chevron-double-left left">
                            </span>
                            Предишен
                        </button>
                        <button
                            className={classnames('', { 'disable': this.state.nextButtonDisabled })}
                            onClick={this.handleNextButtonClick}>
                            <span
                                style={{ marginLeft: '5px' }}
                                className="mdi mdi-chevron-double-right right">
                            </span>
                            Следващ
                        </button>
                        <ExitBtn />
                    </div>
                </Fragment>
            );
        }

        return (
            <div id="quiz">
                <h3 style={{
                    paddingTop: "30px",
                    paddingLeft: "10px",
                }}>Куиз</h3>
                {quizContent}
            </div>
        );
    }
}

Play.propTypes = {
    endFreeQuiz: PropTypes.func.isRequired,
    getFreeQuestions: PropTypes.func.isRequired,
    quiz: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    quiz: state.quiz
});

export default connect(mapStateToProps, { endFreeQuiz, getFreeQuestions })(withRouter(Play));
