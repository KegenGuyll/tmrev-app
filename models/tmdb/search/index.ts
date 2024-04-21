import Iso6391Code from '../ISO639-1';
import type { MovieGeneral } from '../movie/tmdbMovie';
import { PeopleGeneral } from '../person';

interface BaseSearchQuery {
	page?: number;
	query: string;
	language?: Iso6391Code;
}

interface BaseSearchResponse {
	results: unknown[];
	page: number;
	total_pages: number;
	total_results: number;
}

type CompanyResults = {
	id: number;
	logo_path?: string;
	name: string;
};

type CollectionResults = {
	id: number;
	backdrop_path?: string;
	name: string;
	poster_path?: string;
};

type KeywordResults = {
	id: number;
	name: string;
};

interface FindCompanyResponse extends BaseSearchResponse {
	results: CompanyResults[];
}

interface FindCollectionResponse extends BaseSearchResponse {
	results: CollectionResults[];
}

interface FindKeywordsResponse extends BaseSearchResponse {
	results: KeywordResults[];
}

interface FindMoviesResponse extends BaseSearchResponse {
	results: MovieGeneral[];
}

interface FindMultiResponse extends BaseSearchResponse {}

interface FindPeopleResponse extends BaseSearchResponse {
	results: PeopleGeneral[];
}

interface FindTvResponse extends BaseSearchResponse {}

export type {
	CompanyResults,
	BaseSearchQuery,
	BaseSearchResponse,
	FindCollectionResponse,
	FindCompanyResponse,
	FindKeywordsResponse,
	FindMoviesResponse,
	FindMultiResponse,
	FindPeopleResponse,
	FindTvResponse,
};
