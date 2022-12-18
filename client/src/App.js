import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import ScrollToTop from './components/layout/ScrollToTop';
import Header from './components/layout/Header'
import Home from './components/Home'
import Footer from './components/layout/Footer'
import Play from './components/free-quiz/Play';
import FreeGameInstructions from './components/free-quiz/FreeGameInstructions';
import QuizSummary from './components/free-quiz/QuizSummary';
import AddNewQuestion from './components/addNewQuestion';
import Dashboard from './components/user/Dashboard';
import Games from './components/user/Games';
import GameColorcheck from "./components/games/GameColorcheck"

import PrivateRoute from './components/common/PrivateRoute';

import store from './store';

class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Router>
					<ScrollToTop>
						<Fragment>
							<Header />
							<Route path="/" exact component={Home} />
							<Route path="/play" exact component={Play} />
							<Route path="/play/instructions" exact component={FreeGameInstructions} />
							<Route path="/play/quizSummary" exact component={QuizSummary} />
							<Route path="/addNewQuestion" exact component={AddNewQuestion} />
							<Route path="/gameColorCheck" exact component={GameColorcheck} />
							<Switch>
								<PrivateRoute path="/dashboard" exact component={Dashboard} />
							</Switch>
							<Switch>
								<PrivateRoute path="/myGames" exact component={Games} />
							</Switch>
							<Footer />
						</Fragment>
					</ScrollToTop>
				</Router>
			</Provider>
		);
	}
}

export default App;