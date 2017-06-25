import React from 'react';
import ReactDOM from 'react-dom';
import WordCloud from 'react-d3-cloud';
import {ofType, delay, MapTo} from 'rxjs'

const data = [
  { text: 'Hey', value: 1000 },
  { text: 'lol', value: 200 },
  { text: 'first impression', value: 800 },
  { text: 'very cool', value: 1000000 },
  { text: 'duck', value: 10 },
];

const fontSizeMapper = word => word.value / 20;
const rotate = word => (word.value % 90) - 45;

class WordCloudDemo extends React.Component {
  render() {
    const newData = data.map(item => ({
      text: item.text,
      value: Math.random() * 1000,
    }));
    return (
      <WordCloud
        width={1000}
        height={750}
        data={newData}
        fontSizeMapper={fontSizeMapper}
        rotate={rotate}
        padding={2}
      />
    );
  }
}

/* ReactDOM.render(
 *   <WordCloudDemo />,
 *   document.getElementById('root')
 * );*/


const PING = 'PING';
const PONG = 'PONG';

const ping = () => ({ type: PING });

const pingEpic = action$ =>
    action$.ofType(PING)
           .delay(1000) // Asynchronously wait 1000ms then continue
           .mapTo({ type: PONG });

const pingReducer = (state = { isPinging: false }, action) => {
    switch (action.type) {
        case PING:
            return { isPinging: true };

        case PONG:
            return { isPinging: false };

        default:
            return state;
    }
};

// components/App.js

import { connect } from 'react-redux';

let App = ({ isPinging, ping }) => (
    <div>
        <h1>is pinging: {isPinging.toString()}</h1>
        <button onClick={ping}>Start PING</button>
    </div>
);

App = connect(
    ({ isPinging }) => ({ isPinging }),
    { ping }
)(App);

// redux/configureStore.js

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

const epicMiddleware = createEpicMiddleware(pingEpic);

const store = createStore(pingReducer,
                          applyMiddleware(epicMiddleware)
);

// index.js

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
