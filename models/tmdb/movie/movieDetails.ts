import { IMovieQueryGeneral, MovieGeneral } from './tmdbMovie';

interface IMovieDetailQuery extends IMovieQueryGeneral {
	params: {
		append_to_response?: string;
		language?: string;
	};
}

interface IMovieDetailResponse extends MovieGeneral {
	belongs_to_collection?: {
		id: number;
		name: string;
		poster_path: string;
		backdrop_path: string;
	};
}

export type { IMovieDetailQuery, IMovieDetailResponse };
