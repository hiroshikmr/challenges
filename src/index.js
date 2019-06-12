import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { polyfill } from 'es6-promise'; polyfill();

import App from './App';

import './scss/index.scss';

const store = createStore(function (state, action) {
    const _state = state == null ? {
        donate: 0,
        message: '',
        messageType: ''
    } : state;
    console.log(action.type);

    switch (action.type) {
        case 'UPDATE_TOTAL_DONATE':
            return Object.assign({}, _state, {
                donate: _state.donate + action.amount,
            });
        case 'UPDATE_MESSAGE':
            return Object.assign({}, _state, {
                message: action.message,
                messageType: action.messageType
            });

        default:
            return _state;
    }
});

render(
    <Provider store={store}>
       <App />
    </Provider>,
    document.getElementById('root')
);