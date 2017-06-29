export const RESET = 'RESET';
export const LOADED_APP_REVIEWS = 'LOADED_APP_REVIEWS';
export const LOAD_APP_REVIEWS = 'LOAD_APP_REVIEWS';

export const getReviews = (appId) => ({ type: LOAD_APP_REVIEWS, appId: appId });
export const reset = () => ({ type:RESET});

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
        let newReviews =  state.reviews.concat(action.reviews);
        return {reviews:newReviews};

    default:
        return state;
    }
};

export const rootReducer = reviewReducer;
