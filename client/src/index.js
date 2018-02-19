import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

//import { Router, browserHistory } from 'react-router';
//import routes from './routes';

//import './index.css';
require('./stylesheets/App.css');
require('./stylesheets/index.css');

//import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
registerServiceWorker();
