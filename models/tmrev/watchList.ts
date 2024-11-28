import { MovieDetails, TmrevReview } from './review';

interface WatchList {
	_id: string;
	description: string;
	public: boolean;
	title: string;
	userId: string;
	movies: MovieDetails[];
	createdAt: string;
	updatedAt: string;
	tags: string[];
}

interface GetListPayload {
	id: string;
}

interface WatchListSearchQuery {
	q: string;
}

interface AddMovieToWatchList {
	listId: string;
	data: {
		id: number;
	};
}

interface UpdateWatchList {
	description: string;
	title: string;
	public: boolean;
	tags: string[];
	movies: {
		order: number;
		tmdbID: number;
	}[];
	watchListId: string;
}

type CreateWatchList = {
	description: string;
	title: string;
	public: boolean;
	tags: string[];
	movies: { order: number; tmdbID: number }[];
};

type GetUserWatchListResponseData = {
	pageNumber: number;
	pageSize: number;
	totalNumberOfPages: number;
	totalCount: number;
	watchlists: WatchList[];
	emptyWatchlists: WatchList[];
};

type GetUserWatchListResponse = {
	success: boolean;
	body: GetUserWatchListResponseData;
};

type GetUserWatchListSortBy =
	| 'createdAt.asc'
	| 'createdAt.desc'
	| 'updatedAt.asc'
	| 'updatedAt.desc'
	| 'title.asc'
	| 'title.desc';

type GetUserWatchListPayload = {
	pageNumber: number;
	pageSize: number;
	userId?: string;
	textSearch?: string;
	sort_by?: GetUserWatchListSortBy;
};

type GetWatchListDetailsResponse = {
	success: boolean;
	body: WatchList;
};

type GetWatchListDetailsPayload = {
	listId: string;
};

type GetWatchListMovie = {
	id: number;
	budget: number;
	runtime: number;
	title: string;
	reviews: TmrevReview[];
	order: number;
	poster_path: string;
	backdrop_path: string;
};

type GetWatchListInsightsBody = {
	_id: string;
	tags: string[];
	public: boolean;
	description: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	userId: string;
	movies: GetWatchListMovie[];
	user: {
		username: string;
		photoUrl: string;
		uuid: string;
	};
	totalBudget: number;
	totalRuntime: number;
	totalRevenue: number;
	completionPercentage: number;
	averageAdvancedScore: number;
};

type GetWatchListInsightsResponse = {
	success: boolean;
	body: GetWatchListInsightsBody;
};

export type {
	AddMovieToWatchList,
	GetListPayload,
	UpdateWatchList,
	CreateWatchList,
	WatchList,
	WatchListSearchQuery,
	GetUserWatchListResponse,
	GetUserWatchListResponseData,
	GetUserWatchListPayload,
	GetWatchListDetailsResponse,
	GetWatchListDetailsPayload,
	GetWatchListInsightsResponse,
	GetWatchListInsightsBody,
	GetWatchListMovie,
};
