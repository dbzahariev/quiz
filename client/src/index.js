import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import axios from 'axios';
import './styles/styles.scss';
import '../node_modules/@mdi/font/css/materialdesignicons.min.css';
import '../node_modules/materialize-css/dist/js/materialize.min.js';
import '../node_modules/materialize-css/dist/css/materialize.min.css';
import './app.scss';

// if (process.env.NODE_ENV !== "development") {
axios.defaults.baseURL = process.env.BASE_URL;
// }

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  , document.getElementById('root'));