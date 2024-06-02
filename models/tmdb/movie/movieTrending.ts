import { ISO639_1 } from '@/models/tmrev/movie';
import ISO3166_1 from '../ISO3166-1';
import { MovieGeneral } from './tmdbMovie';

type MovieTrendingPayload = {
	pathParams: {
		timeWindow: 'day' | 'week';
	};
	queryParams?: {
		language?: ISO3166_1 | ISO639_1;
	};
};

type MovieTrendingResponse = {
	page: number;
	results: MovieGeneral[];
};

export { MovieTrendingPayload, MovieTrendingResponse };
