import axios from 'axios';
import { Observable } from 'rxjs/Observable';
import {ofType, take, filter, toArray , map} from 'rxjs';
import {LOAD_APP_REVIEWS, LOADED_APP_REVIEWS} from './state';
import {flatMap} from './utils';

Array.prototype.flatMap = flatMap;

function fetchItunesReviewPage(appId, page) {
    return axios.get("https://itunes.apple.com/us/rss/customerreviews/id=" + appId
                     + "/sortBy=mostRecent/page="  + page + "/json");
};

const reviewEpic = (action$, store) =>
    action$.ofType(LOAD_APP_REVIEWS)
    .flatMap(x => Observable.range(1,10).flatMap(y => fetchItunesReviewPage(x.appId, y)))
    .take(10)
    .flatMap(x => x.data.feed.entry)
    .filter(x => x.content)
    .toArray()
    .map(x=> ({type: LOADED_APP_REVIEWS, reviews: x}));

export const rootEpic = reviewEpic;
