import {count, flatMap} from './utils';
import React from 'react';
import ReactDOM from 'react-dom';
import {reset} from './state';
import WordCloud from 'react-d3-cloud';
import {isStopWord} from './words';
import {ofType, take, filter, toArray , map} from 'rxjs';
import { Observable } from 'rxjs/Observable';

Array.prototype.flatMap = flatMap;

function tokenizeText(review) {
    return review
        .split(" ")
        .map(x => x.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\d+]/g,""))
        .map(x => x.toLowerCase())
        .filter(x => isStopWord(x) == false);
}

function wordsToD3Cloud(words) {
    return Object.entries(count(words))
        .filter (x => x[1] > 2)
        .map(x => ({text: x[0] + " " + x[1], value: x[1] * 1000})).slice(1,100);
}

const fontSizeMapper = word => word.value / 20;
const rotate = word => (word.value % 90) - 45;

export class AppReviewCloud extends React.Component {
    constructor(props) {
        super(props);
        this.state = {appId: '284882215'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.reviews = wordsToD3Cloud(this.props.reviews.flatMap(x => tokenizeText(x.content.label)));
    }

    handleChange(event) {
        this.setState({appId: event.target.value});
    }

    handleSubmit(event) {
        this.props.getReviews(this.state.appId);
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
            padding={2}/>
                </div>
                </div>
        );
    }
}
// flatMap(x => reviewsToD3WordCloud(x))
