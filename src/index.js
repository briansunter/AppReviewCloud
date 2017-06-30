import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { connect } from 'react-redux';
import {rootEpic} from './epics';
import {AppReviewCloud} from './ui';
import {getReviews, reset, rootReducer } from './state';

let App = ({getReviews, reviews, reset }) => (
    <div
    key={reviews.length}>
        <p> {reviews.length} </p>
        <AppReviewCloud getReviews={getReviews} reviews={reviews} />
    </div>
);

App = connect(
    ({reviews}) => ({reviews}),
    {getReviews, reset})(App);

const epicMiddleware = createEpicMiddleware(rootEpic);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(epicMiddleware)));

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));
