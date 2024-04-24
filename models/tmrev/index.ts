import type {
	AdvancedScore,
	AllReviewsResponse,
	CreatedAt,
	CreateTmrevReviewQuery,
	CreateTmrevReviewResponse,
	MovieScore,
	SingleReview,
	TmrevReview,
	UpdatedAt,
} from './review';
import type { TheNumberData, TheNumbers, Title } from './theNumbers';
import type { User, UserQuery } from './user';
import type { UpdateWatchList, WatchList, WatchListSearchQuery } from './watchList';

type Timestamp = {
	seconds: number;
	nanoseconds: number;
};

type GetMovieReviewSortBy =
	| 'averagedAdvancedScore.asc'
	| 'averagedAdvancedScore.desc'
	| 'acting.asc.advancedScore'
	| 'acting.desc.advancedScore'
	| 'characters.asc.advancedScore'
	| 'characters.desc.advancedScore'
	| 'cinematography.asc.advancedScore'
	| 'cinematography.desc.advancedScore'
	| 'climax.asc.advancedScore'
	| 'climax.desc.advancedScore'
	| 'ending.asc.advancedScore'
	| 'ending.desc.advancedScore'
	| 'music.asc.advancedScore'
	| 'music.desc.advancedScore'
	| 'personalScore.asc.advancedScore'
	| 'personalScore.desc.advancedScore'
	| 'plot.asc.advancedScore'
	| 'plot.desc.advancedScore'
	| 'theme.asc.advancedScore'
	| 'theme.desc.advancedScore'
	| 'visuals.asc.advancedScore'
	| 'visuals.desc.advancedScore'
	| 'reviewedDate.asc'
	| 'reviewedDate.desc';

interface MovieReviewQuery {
	count?: number;
	include_user_review?: string;
	skip?: number;
	sort_by?: GetMovieReviewSortBy;
}

interface MovieReviewPayload {
	movie_id: number;
	query?: MovieReviewQuery;
}

export type {
	AdvancedScore,
	AllReviewsResponse,
	CreatedAt,
	CreateTmrevReviewQuery,
	CreateTmrevReviewResponse,
	MovieScore,
	SingleReview,
	TheNumberData,
	TheNumbers,
	Timestamp,
	Title,
	TmrevReview,
	UpdatedAt,
	UpdateWatchList,
	User,
	UserQuery,
	WatchList,
	WatchListSearchQuery,
	MovieReviewQuery,
	MovieReviewPayload,
};
