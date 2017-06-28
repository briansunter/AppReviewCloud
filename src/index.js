import React from 'react';
import ReactDOM from 'react-dom';
import WordCloud from 'react-d3-cloud';
import {flatMap, ofType, delay, MapTo, subscribe,repeat, map} from 'rxjs'
import { Observable } from 'rxjs/Observable';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { connect } from 'react-redux';
import axios from 'axios';
import Promise from 'bluebird';

var words = [
    'about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 'as', 'at', 'be',
    'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can',
    'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had',
    'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into',
    'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must',
    'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over',
    'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than',
    'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
    'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were',
    'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your', 'a', 'i', "it's", "i'm"]

function isStopWord(word) {
    return words.includes(word);
}

function fetchItunesReviewPage(appId, page) {
    return Observable.fromPromise(axios.get("https://itunes.apple.com/us/rss/customerreviews/id=" + appId  + "/sortBy=mostRecent/page="  + page + "/json"));
};

const RESET = 'RESET';
const LOADED_APP_REVIEWS = 'LOADED_APP_REVIEWS';
const LOAD_APP_REVIEWS = 'LOAD_APP_REVIEWS';

const getReviews = (appId) => ({ type: LOAD_APP_REVIEWS, appId: appId });
const reset = () => ({ type:RESET});

const reviewEpic = (action$, store) =>
    action$.ofType(LOAD_APP_REVIEWS)
           .flatMap(x => Observable.range(1,10).flatMap(y => Observable.defer(() => fetchItunesReviewPage(x.appId, y))))
           .flatMap(x => x.data.feed.entry)
           .filter(x => x.content)
           .bufferCount(10)
           .map(x=> ({type: LOADED_APP_REVIEWS,
                      reviews: x}))

const defaultState = {
    reviews: []
};

const reviewReducer = (state = defaultState, action) => {
    switch (action.type) {
        case RESET:
            return {reviews: []};

        case LOAD_APP_REVIEWS:
            return {reviews: []};

        case LOADED_APP_REVIEWS:
            let newReviews =  state.reviews.concat(action.reviews)
            return {reviews:newReviews};

        default:
            return state;
    }
};

const epicMiddleware = createEpicMiddleware(reviewEpic);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reviewReducer,
                          composeEnhancers(applyMiddleware(epicMiddleware))
);

Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};

function reviewToD3WordCloud(review) {
    return {text: "foo", value: 1000};
}

/* review.content.label
 *              .toLowerCase()
 *              .split(" ")
 *              .map(x => x.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""))
 *              .filter(x => isStopWord(x) == false)
 *              .reduce((map, word) =>
 *                  Object.assign(map, {
 *                      [word]: (map[word])
 *                      ? map[word] + 1
 *                      : 1,
 *                  }),{})
 *              .flatMap (x => Object.entries(x))
 *              .filter (x => x[1] > 0)
 *              .map(x => ({text: x[0], value: x[1]}))}*/

const fontSizeMapper = word => word.value / 20;
const rotate = word => (word.value % 90) - 45;

// index.js
class AppReviewCloud extends React.Component {
    constructor(props) {
        super(props);
        this.state = {appId: '284882215'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({appId: event.target.value});
    }

    handleSubmit(event) {
        this.props.getReviews(this.state.appId)
        event.preventDefault();
    }

    render() {
        let cloudReviews = [{text: "foo", value: 1000}]
        return (
            <div>
            <form onSubmit={this.handleSubmit}>
            <label>
            iTunes App Id:
            <input type="text" value={this.state.appId} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Create Review Cloud" />
            </form>
            <form onSubmit={reset}>
            <input type="submit" value="Reset" />
            </form>
            <div
            key={this.props.reviews.length}>
            <WordCloud
            height={window.screen.availHeight}
            width={window.screen.availWidth}
            data={this.props.reviews}
            fontSizeMapper={fontSizeMapper}
            rotate={rotate}
            padding={6}/>
            </div>
            </div>
        );
    }
}

let App = ({ getReviews, reviews,reset }) => (
    <div>
        <p> {reviews.length} </p>
        <AppReviewCloud getReviews={getReviews} reviews={reviews} />
    </div>
);



App = connect(
    (state) => ({reviews: state.reviews.map(x => ({text: "hello", value: 1000}))}),
    { getReviews, reset }
)(App);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
