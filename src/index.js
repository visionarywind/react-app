import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import CommentApp from './component/CommentApp';
import Header from './Header';
import './index.css';
import List from './List';
import * as serviceWorker from './serviceWorker';

ReactDOM.render( 
    <React.StrictMode >
    <Header />
    <CommentApp />
    <List />
    <App />
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();