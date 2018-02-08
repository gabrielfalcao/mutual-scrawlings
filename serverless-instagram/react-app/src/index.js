import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.css'
import 'open-iconic/font/css/open-iconic-bootstrap.css'

import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App auth0Config={{domain: "jjanczyszyn.auth0.com", clientId: "hrIRGALItbQgDRM2m4NrpSZ5RucNu3zd"}} />, document.getElementById('root'));
registerServiceWorker();
