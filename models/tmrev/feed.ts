import { TmrevReview } from './review';

type FeedResponse = {
	success: boolean;
	body: {
		pageNumber: number;
		pageSize: number;
		totalNumberOfPages: number;
		totalCount: number;
		feed: Feed;
	};
};

type FeedReviews = TmrevReview & {
	replies: number;
	seen: boolean;
	userDetails: {
		firstName: string;
		lastName: string;
		photoUrl: string;
		uuid: string;
		_id: string;
	};
};

type Feed = {
	_id: string;
	reviews: FeedReviews[];
};

type FeedQuery = {
	pageNumber: number;
	pageSize: number;
};

export type { FeedResponse, Feed, FeedQuery, FeedReviews };
