import React from 'react';
import ReactDOM from 'react-dom';
import './styles/styles.scss';
import '../node_modules/@mdi/font/css/materialdesignicons.min.css';
import '../node_modules/materialize-css/dist/js/materialize.min.js';
import '../node_modules/materialize-css/dist/css/materialize.min.css';
import App from './App';
import './app.scss';
import axios from 'axios';

axios.defaults.baseURL = 'https://quiz-hnnb.onrender.com';

ReactDOM.render(<App />, document.getElementById('root'));