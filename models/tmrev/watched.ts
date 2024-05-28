import { MovieDetails } from './review';

interface WatchedResponse {
	success: boolean;
	body: {
		pageNumber: number;
		pageSize: number;
		totalNumberOfPages: number;
		totalCount: number;
		watched: Watched[];
	};
	error?: any;
}

type SingleWatchedResponse = {
	success: boolean;
	body: Watched | null;
};

type SingleWatchedQuery = {
	userId: string;
	tmdbID: number;
};

type WatchedQuery = {
	query: {
		pageNumber: number;
		pageSize: number;
	};
	userId: string;
};

interface WatchedPayload {
	liked: boolean;
	tmdbID: number;
	_id?: string;
}

interface WatchedDeletePayload {
	authToken: string;
	watchedId: string;
}

type Watched = {
	_id: string;
	liked: boolean;
	tmdbID: number;
	createdAt: string;
	updatedAt: string;
	userId: string;
	movieDetails: MovieDetails;
};

export type {
	Watched,
	WatchedDeletePayload,
	WatchedPayload,
	WatchedResponse,
	WatchedQuery,
	SingleWatchedResponse,
	SingleWatchedQuery,
};
