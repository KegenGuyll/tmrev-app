import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { tmdbAPIKey, tmdbBaseUrl } from '@/constants/tmrev';
import { DiscoverMovieQuery, IDiscoverMovieResponse } from '@/models/tmdb/discover';
import {
	BaseSearchQuery,
	FindCollectionResponse,
	FindCompanyResponse,
	FindKeywordsResponse,
	FindMoviesResponse,
	FindMultiResponse,
	FindPeopleResponse,
	FindTvResponse,
} from '@/models/tmdb/search';

export const searchApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: `${tmdbBaseUrl}search`,
		prepareHeaders: (headers) => headers,
	}),
	endpoints: (builder) => ({
		findCollection: builder.query<FindCollectionResponse, BaseSearchQuery>({
			query: (data) => ({
				params: {
					api_key: tmdbAPIKey,
					...data,
				},
				url: '/collection',
			}),
		}),
		findCompanies: builder.query<FindCompanyResponse, BaseSearchQuery>({
			query: (data) => ({
				params: {
					api_key: tmdbAPIKey,
					...data,
				},
				url: '/company',
			}),
		}),
		findKeywords: builder.query<FindKeywordsResponse, BaseSearchQuery>({
			query: (data) => ({
				params: {
					api_key: tmdbAPIKey,
					...data,
				},
				url: '/keyword',
			}),
		}),
		findMovieYear: builder.query<IDiscoverMovieResponse, DiscoverMovieQuery>({
			query: (data) => ({
				params: {
					api_key: tmdbAPIKey,
					...data,
				},
				url: `${tmdbBaseUrl}/discover/movie`,
			}),
		}),
		findMovies: builder.query<FindMoviesResponse, BaseSearchQuery>({
			query: (data) => ({
				params: {
					api_key: tmdbAPIKey,
					...data,
				},
				url: '/movie',
			}),
		}),
		findMulti: builder.query<FindMultiResponse, BaseSearchQuery>({
			query: (data) => ({
				params: {
					api_key: tmdbAPIKey,
					...data,
				},
				url: '/multi',
			}),
		}),
		findPeople: builder.query<FindPeopleResponse, BaseSearchQuery>({
			query: (data) => ({
				params: {
					api_key: tmdbAPIKey,
					...data,
				},
				url: '/person',
			}),
			transformResponse: (response: FindPeopleResponse) => {
				const newResults = [...response.results];

				newResults.sort((a, b) => b.popularity - a.popularity);

				return {
					...response,
					results: newResults,
				};
			},
		}),
		findTv: builder.query<FindTvResponse, BaseSearchQuery>({
			query: (data) => ({
				params: {
					api_key: tmdbAPIKey,
					...data,
				},
				url: '/tv',
			}),
		}),
	}),
	reducerPath: 'searchApi',
});

export const {
	useFindCollectionQuery,
	useFindCompaniesQuery,
	useFindKeywordsQuery,
	useFindMoviesQuery,
	useFindMultiQuery,
	useFindPeopleQuery,
	useFindTvQuery,
	useFindMovieYearQuery,
	util: { getRunningQueriesThunk },
} = searchApi;

export const {
	findCollection,
	findCompanies,
	findKeywords,
	findMovies,
	findMulti,
	findPeople,
	findTv,
	findMovieYear,
} = searchApi.endpoints;
