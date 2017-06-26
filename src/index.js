import React from 'react';
import ReactDOM from 'react-dom';
import WordCloud from 'react-d3-cloud';
import {flatMap, ofType, delay, MapTo, subscribe,repeat, map} from 'rxjs'
import { Observable } from 'rxjs/Observable';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { connect } from 'react-redux';
import axios from 'axios';
import Promise from 'bluebird';

function fetchItunesReviewPage(appId,page) {
    return Observable.fromPromise(axios.get("https://itunes.apple.com/us/rss/customerreviews/id=" + appId  + "/sortBy=mostRecent/page="  + page + "/json"));
};

const LOADED_APP_REVIEWS = 'LOADED_APP_REVIEWS';
const LOAD_APP_REVIEWS = 'LOAD_APP_REVIEWS';

const getReviews = (appId) => ({ type: LOAD_APP_REVIEWS, appId: appId });

const reviewEpic = (action$, store) =>
    action$.ofType(LOAD_APP_REVIEWS)
           .flatMap(x => fetchItunesReviewPage(x.appId, store.getState().page))
           .flatMap(x => x.data.feed.entry)
           .filter(x => x.content)
           .filter(x => x.content.label)
           .map(x => x.content.label)
           .flatMap(x => x.split(" "))
           .map(x => x.toLowerCase())
           .map(x => x.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""))
           .take(2000)
           .reduce((map, word) =>
               Object.assign(map, {
                   [word]: (map[word])
                   ? map[word] + 1
                   : 1,
               }),{})
           .flatMap (x => Object.entries(x))
.filter (x => x[1] > 1)
           .map(x => ({text:x[0], value: x[1] * 100 }))
           .toArray()
           .map(x=> ({type: LOADED_APP_REVIEWS,
                      reviews: x}))

const defaultState = {
    isPinging: false,
    reviews: [],
    page: 1,
};

const pingReducer = (state = defaultState, action) => {
    switch (action.type) {

        case LOADED_APP_REVIEWS:
            return {reviews: state.reviews.concat(action.reviews),
                    isPinging: false,
                    page: state.page + 1
            };

        default:
            return state;
    }
};

const epicMiddleware = createEpicMiddleware(reviewEpic);

const store = createStore(pingReducer,
                          applyMiddleware(epicMiddleware)
);

const fontSizeMapper = word => word.value / 20;
const rotate = word => (word.value % 90) - 45;

// index.js

let App = ({ getReviews, ping, reviews}) => (
    <div key={reviews.length}>
        <p> {reviews.length } </p>
        <button onClick={ping}>Start PING</button>
        <button onClick={() => getReviews(722217471)}>Start Reviews</button>
        <WordCloud
            height={window.screen.availHeight}
            width={window.screen.availWidth}
            data={reviews}
            fontSizeMapper={fontSizeMapper}
            rotate={rotate}/>
    </div>
);

App = connect(
    ({ reviews }) => ({ reviews }),
    { getReviews }
)(App);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
