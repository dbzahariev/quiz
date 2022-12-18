import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import ScrollToTop from './components/layout/ScrollToTop';
import Header from './components/layout/Header'
import Home from './components/Home'
import Footer from './components/layout/Footer'
import Play from './components/free-quiz/Play';
import FreeGameInstructions from './components/free-quiz/FreeGameInstructions';
import QuizSummary from './components/free-quiz/QuizSummary';
import AddNewQuestion from './components/addNewQuestion';
import GameColorcheck from "./components/games/GameColorcheck"

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
							<Footer />
						</Fragment>
					</ScrollToTop>
				</Router>
			</Provider>
		);
	}
}

export default App;