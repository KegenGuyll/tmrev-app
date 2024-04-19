import { IMovieQueryGeneral } from './tmdbMovie';
import ISO6391 from '../ISO639-1';

interface IMovieImagesQuery extends IMovieQueryGeneral {
	params: {
		include_image_language?: string;
		language?: string;
	};
}

type MovieImage = {
	aspect_ratio: number;
	height: number;
	iso_631_1: ISO6391;
	file_path: string;
	vote_average: number;
	vote_count: number;
	width: number;
};

interface IMovieImageResponse {
	backdrops: MovieImage[];
}

export type { IMovieImageResponse, IMovieImagesQuery, MovieImage };
