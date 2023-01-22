import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Home extends Component {
    render() {
        return (
            <Fragment>
                <Helmet><title>Куиз - Начало</title></Helmet>
                <div id="home">
                    <section>
                        <div style={{ textAlign: 'center' }}>
                            <span className="mdi mdi-cube-outline cube"></span>
                        </div>
                        <h1>Куиз</h1>
                        <div className="playButtonContainer">
                            <ul>
                                <li>
                                    <Link className="playButton" to="/play">Нов Куиз</Link>
                                </li>
                            </ul>
                        </div>
                        <div className='gamesContainer'>
                            <Link to="/play/host">Водещ</Link>
                            <Link to="/gameColorCheck">Играй провери цвета</Link>
                            {localStorage.getItem("adminPass") === "1" ?
                                <Link to="/addNewQuestion">Добави нов въпрос</Link> : <></>}
                        </div>
                    </section>
                </div>
            </Fragment>
        );
    }
}

Home.propTypes = {
    auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    auth: state.auth
});

export default connect(mapStateToProps)(Home);