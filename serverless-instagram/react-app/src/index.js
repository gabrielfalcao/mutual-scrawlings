import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.css'
import 'open-iconic/font/css/open-iconic-bootstrap.css'

import App from './App';
import registerServiceWorker from './registerServiceWorker';
import auth0Config from './config'
ReactDOM.render(<App auth0Config={auth0Config} />, document.getElementById('root'));
registerServiceWorker();
