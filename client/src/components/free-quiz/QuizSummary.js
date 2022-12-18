import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

import { clearQuizStats } from '../../actions/quizActions';

import isEmpty from '../../validation/is-empty';

class QuizSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            score: 0,
            type: '',
            numberOfQuestions: 0,
            numberOfAnsweredQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            usedHints: 0,
            usedfiftyFifty: 0
        };
    }

    componentDidMount() {
        const { quizStats } = this.props.quiz;
        this.setState({
            score: (quizStats.score / quizStats.numberOfQuestions) * 100,
            type: quizStats.type,
            numberOfQuestions: quizStats.numberOfQuestions,
            numberOfAnsweredQuestions: quizStats.numberOfAnsweredQuestions,
            correctAnswers: quizStats.correctAnswers,
            wrongAnswers: quizStats.wrongAnswers,
            usedHints: quizStats.usedHints,
            usedfiftyFifty: quizStats.usedfiftyFifty
        });
    }

    componentWillUnmount() {
        this.props.clearQuizStats();
    }

    render() {
        const score = this.props.quiz.quizStats;
        const userScore = this.state.score;
        let remark;
        if (userScore <= 30) {
            remark = 'Нуждаеш се от повече практика!';
        } else if (userScore > 30 && userScore <= 50) {
            remark = 'Успех следващият път!';
        } else if (userScore <= 70 && userScore > 50) {
            remark = 'Можеш да се справиш и по добре!';
        } else if (userScore >= 71 && userScore <= 84) {
            remark = 'Много добре се справи!'
        } else {
            remark = 'Ти си гений!'
        }

        let stats;

        if (!isEmpty(score)) {
            stats = (
                <Fragment>
                    <Helmet><title>Обобщение на играта</title></Helmet>
                    <div style={{ textAlign: 'center' }}>
                        <span className="mdi mdi-check-circle-outline success-icon"></span>
                    </div>
                    <h1>Поздравления!</h1>
                    <div className="container stats">
                        <h4>{remark}</h4>
                        <h2 className={classnames('perfect-score', {
                            'perfect-score': this.state.score > 85
                        })}>Общ брой точки: {this.state.score.toFixed(0)}&#37;</h2>
                        <span className="stat left">Общ брой въпроси: </span><span className="right">{this.state.numberOfQuestions}</span><br />
                        <span className="stat left">Общ брой на отговорените въпроси: </span><span className="right">{this.state.numberOfAnsweredQuestions}</span><br />
                        <span className="stat left">Верни отговори: </span><span className="right">{this.state.correctAnswers}</span><br />
                        <span className="stat left">Грешни отговори: </span><span className="right">{this.state.wrongAnswers}</span><br />
                        <span className="stat left">Подсказки: </span><span className="right">{10 - (this.state.usedHints * -1)} от 10</span><br />
                        <span className="stat left">50 - 50: </span><span className="right">{this.state.usedfiftyFifty} от 2</span><br />
                    </div>
                    <section>
                        <ul>
                            <li><Link to="/play">Нова игра</Link></li>
                            <li><Link to="/">Връщане в началото</Link></li>
                        </ul>
                    </section>
                </Fragment>
            );
        } else {
            stats = <section>
                <h1 className="no-stats">Няма намерена статистика</h1>
                <ul>
                    <li><Link to="/play">Нова игра</Link></li>
                </ul>
            </section>
        }
        return (
            <div className="quiz-summary">
                {stats}
            </div>
        );
    }
}

QuizSummary.propTypes = {
    clearQuizStats: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
    quiz: state.quiz
});

export default connect(mapStateToProps, { clearQuizStats })(QuizSummary);