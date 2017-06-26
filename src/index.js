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

const data = [
    { text: 'Hey', value: 1000 },
    { text: 'lol', value: 200 },
    { text: 'first impression', value: 800 },
    { text: 'very cool', value: 1000000 },
    { text: 'duck', value: 10 },
];

function fetchHttpPage(params) {
    return Observable.of({items: [{text: "This is a test" , value: 9999999999}], nextPageToken: "2"}).repeat()
};

function fetchItunesReviewPage(appId,page) {
    return Observable.fromPromise(axios.get("https://itunes.apple.com/us/rss/customerreviews/id=" + appId  + "/sortBy=mostRecent/page="  + page + "/json"));
};

const PING = 'PING';
const PONG = 'PONG';
const LOADED_APP_REVIEWS = 'LOADED_APP_REVIEWS';
const LOAD_APP_REVIEWS = 'LOAD_APP_REVIEWS';

const ping = () => ({ type: PING });
const getReviews = (appId) => ({ type: LOAD_APP_REVIEWS, appId: appId });

const pingEpic = action$ =>
    action$.ofType(PING)
           .delay(1000) // Asynchronously wait 1000ms then continue
           .mapTo({ type: PONG });

//72221747
const reviewEpic = (action$, store) =>
    action$.ofType(LOAD_APP_REVIEWS)
           .flatMap(x => fetchItunesReviewPage(x.appId, store.getState().page))
           .flatMap(x => x.data.feed.entry)
           .filter(x => x.content)
.map (x => ({text: x.content.label, value: 100}))

           .map(x=> ({type: LOADED_APP_REVIEWS,
                   reviews: [x]}))

Observable.of(getReviews(722217471))
.flatMap(x => fetchItunesReviewPage(x.appId, 1))
           .map(x => x.data.feed.entry)
           .subscribe(x => console.log(x))

/* .flatMap(x => fetchItunesReviewPage(x.appId, 1))
   .flatMap(x => x.data.feed.entry)
   .filter(x => x.content)
   .map(x=> {type: LOADED_APP_REVIEWS,
 *           reviews: [x]})
   .subscribe(x => console.log(x))*/

const defaultState = {
    isPinging: false,
    reviews: data,
    page: 1,
};

const pingReducer = (state = defaultState, action) => {
    switch (action.type) {
        case PING:
            return { isPinging: true };

        case PONG:
            return { isPinging: false };

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

/* ReactDOM.render(
 *   <WordCloudDemo />,
 *   document.getElementById('root')
 * );*/

// index.js

let App = ({ isPinging, getReviews, ping, reviews}) => (
    <div>
        <p> {reviews.length } </p>
        <button onClick={ping}>Start PING</button>
        <button onClick={() => getReviews(722217471)}>Start Reviews</button>
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
    { ping, getReviews }
)(App);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
