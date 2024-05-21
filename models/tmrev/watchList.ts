import { MovieDetails } from './review';

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
	authToken: string;
}

interface WatchListSearchQuery {
	q: string;
}

interface AddMovieToWatchList {
	token: string;
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
	movies: MovieDetails[];
	watchListId: string;
}

type CreateWatchList = {
	description: string;
	title: string;
	public: boolean;
	tags: string[];
	movies: MovieDetails[];
};

type GetUserWatchListResponseData = {
	pageNumber: number;
	pageSize: number;
	totalNumberOfPages: number;
	totalCount: number;
	watchlists: WatchList[];
};

type GetUserWatchListResponse = {
	success: boolean;
	body: GetUserWatchListResponseData;
};

type GetUserWatchListPayload = {
	pageNumber: number;
	pageSize: number;
	userId?: string;
	textSearch?: string;
	sortBy?: string;
};

type GetWatchListDetailsResponse = {
	success: boolean;
	body: WatchList;
};

type GetWatchListDetailsPayload = {
	listId: string;
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
};
