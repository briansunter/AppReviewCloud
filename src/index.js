import React from 'react';
import ReactDOM from 'react-dom';
import WordCloud from 'react-d3-cloud';
import {ofType, delay, MapTo} from 'rxjs'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { connect } from 'react-redux';

const data = [
  { text: 'Hey', value: 1000 },
  { text: 'lol', value: 200 },
  { text: 'first impression', value: 800 },
  { text: 'very cool', value: 1000000 },
  { text: 'duck', value: 10 },
];

const PING = 'PING';
const PONG = 'PONG';

const ping = () => ({ type: PING });

const pingEpic = action$ =>
    action$.ofType(PING)
           .delay(1000) // Asynchronously wait 1000ms then continue
           .mapTo({ type: PONG });

const defaultState = {
    isPinging: false,
    reviews: data,
};

const pingReducer = (state = defaultState, action) => {
    switch (action.type) {
        case PING:
            return { isPinging: true };

        case PONG:
            return { isPinging: false };

        default:
            return state;
    }
};

const epicMiddleware = createEpicMiddleware(pingEpic);

const store = createStore(pingReducer,
                          applyMiddleware(epicMiddleware)
);

const fontSizeMapper = word => word.value / 20;
const rotate = word => (word.value % 90) - 45;

/* ReactDOM.render(
 *   <WordCloudDemo />,
 *   document.getElementById('root')
 * );*/

// index.js

let App = ({ isPinging, ping, reviews}) => (
    <div>
        <h1>is pinging: {isPinging.toString()}</h1>
        <button onClick={ping}>Start PING</button>
        <WordCloud
            width={1000}
            height={750}
            data={reviews}
            fontSizeMapper={fontSizeMapper}
            rotate={rotate}
            padding={2}/>
    </div>
);

App = connect(
    ({ isPinging, reviews }) => ({ isPinging, reviews }),
    { ping }
)(App);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
