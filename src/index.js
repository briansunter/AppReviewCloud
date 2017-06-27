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

const LOADED_APP_REVIEWS = 'LOADED_APP_REVIEWS';
const LOAD_APP_REVIEWS = 'LOAD_APP_REVIEWS';

const getReviews = (appId) => ({ type: LOAD_APP_REVIEWS, appId: appId });

const reviewEpic = (action$, store) =>
    action$.ofType(LOAD_APP_REVIEWS)
           .flatMap(x => Observable.range(1,10).flatMap(y => fetchItunesReviewPage(x.appId, y)))
           .flatMap(x => x.data.feed.entry)
           .defaultIfEmpty([])
           .filter(x => x.content)
           .filter(x => x.content.label)
           .map(x => x.content.label)
           .flatMap(x => x.split(" "))
           .map(x => x.toLowerCase())
           .map(x => x.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""))
           .filter(x => isStopWord(x) == false)
           .scan((map, word) =>
               Object.assign(map, {
                   [word]: (map[word])
                   ? map[word] + 1
                   : 1,
               }),{})
           .flatMap (x => Object.entries(x))
           .filter (x => x[1] > 0)
           .map(x => ({text:x[0], value: x[1] * 250 }))
.bufferCount(100)
           .map(x=> ({type: LOADED_APP_REVIEWS,
                      reviews: x})).take(2)

const defaultState = {
    reviews: []
};

const reviewReducer = (state = defaultState, action) => {
    console.log(action);
    switch (action.type) {
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

const store = createStore(reviewReducer,
                          applyMiddleware(epicMiddleware)
);

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
        return (
            <div>
            <form onSubmit={this.handleSubmit}>
            <label>
            iTunes App Id:
                           <input type="text" value={this.state.appId} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Create Review Cloud" />
            </form>
            <WordCloud
            height={window.screen.availHeight}
            width={window.screen.availWidth}
            data={this.props.reviews}
            fontSizeMapper={fontSizeMapper}
            rotate={rotate}
            padding={6}/>
            </div>
        );
    }
}

let App = ({ getReviews, reviews}) => (
    <div key={reviews.length}>
        <p> {reviews.length} </p>
        <AppReviewCloud getReviews={getReviews} reviews={reviews} />
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
