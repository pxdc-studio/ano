import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import * as serviceWorker from './serviceWorker';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.render((
  <BrowserRouter>
    <ToastContainer />
    <App />
  </BrowserRouter>
), document.getElementById('root'));

serviceWorker.unregister();
