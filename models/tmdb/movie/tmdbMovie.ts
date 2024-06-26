interface IMovieQueryGeneral {
	movie_id: number;
}

type MovieGeneral = {
	poster_path?: string;
	adult: boolean;
	overview: string;
	release_date: string;
	genre_ids: number[];
	id: number;
	original_title: string;
	original_language: string;
	title: string;
	backdrop_path?: string;
	popularity: number;
	vote_count: number;
	video: boolean;
	vote_average: number;
	budget?: number;
	tagline?: string;
	status?: string;
	genres: Genre[];
	runtime: number;
	imdb_id?: string;
	revenue?: number;
};

interface Genre {
	id: number;
	name: string;
}

export type { IMovieQueryGeneral, MovieGeneral, Genre };
