/* eslint-disable import/no-cycle */
import { GetMovieReviewSortBy } from '.';
// eslint-disable-next-line import/no-cycle
import { Comment, Vote } from './comments';
import { Genre, Profile } from './movie';

export type MovieDetails = {
	backdrop_path: string | undefined;
	budget: number | undefined;
	genres: Genre[];
	id: number;
	imdb_id: string | undefined;
	original_language: string;
	poster_path: string | undefined;
	release_date: string;
	revenue: number | undefined;
	runtime: number;
	title: string;
};

interface TmrevReview {
	_id: string;
	advancedScore: AdvancedScore;
	averagedAdvancedScore: number | null;
	createdAt: CreatedAt;
	updatedAt: UpdatedAt;
	notes: string;
	public: boolean;
	title: string;
	tmdbID: number;
	userId: string;
	reviewedDate: string;
	profile?: Profile;
	comments?: Comment[];
	votes?: Vote;
	movieDetails: MovieDetails;
}

interface AllReviewsResponse {
	success: boolean;
	body: {
		reviews: TmrevReview[];
		avgScore: AdvancedScore | null;
		likes: number;
		dislikes: number;
		total: number;
	};
}

type GetUserMovieReviewsResponse = {
	success: boolean;
	body: {
		pageNumber: number;
		pageSize: number;
		totalNumberOfPages: number;
		totalCount: number;
		reviews: TmrevReview[];
	};
};

type GetUserMovieReviewsPayload = {
	userId: string;
	query?: GetUserMovieReviewsQuery;
};

type GetUserMovieReviewsQuery = {
	sort_by: GetMovieReviewSortBy;
	pageNumber: number;
	pageSize: number;
	advancedScore?: string;
	textSearch?: string;
};

interface CreateTmrevReviewQuery {
	title: string;
	advancedScore: {
		acting: number;
		characters: number;
		cinematography: number;
		climax: number;
		ending: number;
		music: number;
		personalScore: number;
		plot: number;
		theme: number;
		visuals: number;
	};
	tmdbID: number;
	reviewedDate: string;
	notes: string;
	public: boolean;
}
interface CreateTmrevReviewResponse {
	acknowledged: boolean;
	insertedId: string;
}

interface AdvancedScore {
	acting: number;
	characters: number;
	cinematography: number;
	climax: number;
	ending: number;
	music: number;
	personalScore: number;
	plot: number;
	theme: number;
	visuals: number;
	totalScore: number;
	_id: number;
}

export type CreatedAt =
	| string
	| {
			seconds: number;
			nanoseconds: number;
	  };

type UpdatedAt =
	| string
	| {
			seconds: number;
			nanoseconds: number;
	  };

interface MovieScore {
	_id: ID;
	totalScore: number;
	plot: number;
	theme: number;
	climax: number;
	ending: number;
	acting: number;
	characters: number;
	music: number;
	cinematography: number;
	visuals: number;
	personalScore: number;
}

interface ID {
	tmdbID: number;
	title: string;
}

interface SingleReview {
	reviewId: string;
}

interface DeleteReviewQuery {
	authToken: string;
	reviewId: string;
}

type GetUserHighlightedReviewsResponse = {
	success: boolean;
	body: {
		highest: TmrevReview[];
		lowest: TmrevReview[];
	};
};

type GetReviewByActorResponse = {
	success: boolean;
	reviews: TmrevReview[];
};

type GetReviewByActorParams = {
	actorId: number;
	userId: string;
};

type GetReviewByMovieIdSortBy =
	| 'createdAt.asc'
	| 'createdAt.desc'
	| 'averagedAdvancedScore.asc'
	| 'averagedAdvancedScore.desc'
	| 'updatedAt.asc'
	| 'updatedAt.desc'
	| 'upVote.asc.votes'
	| 'upVote.desc.votes'
	| 'downVote.asc.votes'
	| 'downVote.desc.votes';

type GetReviewByMovieIdQuery = {
	movieId: number;
	query: {
		includeUserReview?: string;
		pageNumber: number;
		pageSize: number;
		sort_by?: GetReviewByMovieIdSortBy;
	};
};

type GetReviewByMovieIdResponse = {
	success: boolean;
	body: {
		pageNumber: number;
		pageSize: number;
		totalNumberOfPages: number;
		totalCount: number;
		reviews: TmrevReview[];
		includeUserReview: TmrevReview[];
	};
};

export type {
	AdvancedScore,
	AllReviewsResponse,
	CreateTmrevReviewQuery,
	CreateTmrevReviewResponse,
	DeleteReviewQuery,
	MovieScore,
	SingleReview,
	TmrevReview,
	UpdatedAt,
	GetUserMovieReviewsResponse,
	GetUserMovieReviewsPayload,
	GetUserHighlightedReviewsResponse,
	GetUserMovieReviewsQuery,
	GetReviewByActorResponse,
	GetReviewByActorParams,
	GetReviewByMovieIdQuery,
	GetReviewByMovieIdResponse,
};
