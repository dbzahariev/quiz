import React from 'react';
import ReactDOM from 'react-dom';
import './styles/styles.scss';
import '../node_modules/@mdi/font/css/materialdesignicons.min.css';
import '../node_modules/materialize-css/dist/js/materialize.min.js';
import '../node_modules/materialize-css/dist/css/materialize.min.css';
import App from './App';
import './app.scss';
import axios from 'axios';

// if (process.env.NODE_ENV !== "development") {
  axios.defaults.baseURL = "https://http-nodejs-production-c2b5.up.railway.app";
// }

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  , document.getElementById('root'));