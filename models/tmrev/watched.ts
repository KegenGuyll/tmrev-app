import { MovieDetails } from './review';

interface WatchedResponse {
	success: boolean;
	body: Watched[];
	error?: any;
}

interface WatchedPayload {
	liked: boolean;
	posterPath: string;
	title: string;
	tmdbID: number;
	authToken: string;
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

export type { Watched, WatchedDeletePayload, WatchedPayload, WatchedResponse };
