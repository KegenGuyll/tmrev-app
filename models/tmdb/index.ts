import ISO3166_1 from './ISO3166-1';

// eslint-disable-next-line no-unused-vars
enum MediaType {
	// eslint-disable-next-line no-unused-vars
	MOVIE = 'movie',
	// eslint-disable-next-line no-unused-vars
	TV = 'tv',
}

interface TVGeneric {
	adult: boolean;
	backdrop: string;
	id: number;
	name: string;
	original_language: string;
	original_name: string;
	overview: string;
	poster_path: string;
	media_type: MediaType;
	genre_ids: number[];
	popularity: number;
	first_air_date: string;
	vote_average: number;
	vote_count: number;
	origin_county: string[];
}

type KnownForGeneric = {
	poster_path?: string;
	id: number;
	overview: string;
	backdrop_path?: string;
	vote_average: number;
	vote_count: number;
	popularity: number;
	genre_ids: number[];
	original_language: string;
};

type KnownForMovie = KnownForGeneric & {
	media_type: MediaType.MOVIE;
	adult: boolean;
	release_date: string;
	original_title: string;
	title: string;
	video: boolean;
};

type KnownForTV = KnownForGeneric & {
	media_type: MediaType.TV;
	first_air_date: string;
	origin_county: number[];
	name: string;
	original_name: string;
};

type Titles = {
	iso_3166_1: ISO3166_1;
	title: string;
	type: string;
};

export type { KnownForGeneric, KnownForMovie, KnownForTV, MediaType, Titles, TVGeneric };
