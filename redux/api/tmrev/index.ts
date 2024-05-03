import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { TMREV_API_URL } from '@env';
import { CategoryDataResponse } from '@/models/tmrev/categories';
import {
	RetrieveFollowerFeedResponse,
	RetrieveFollowerResponse,
	RetrieveFollowingResponse,
	RetrieveFollowQuery,
} from '@/models/tmrev/follow';
import {
	INotificationResponse,
	IRetrieveNotificationQuery,
	IUpdateNotificationQuery,
} from '@/models/tmrev/notifications';

import {
	CreateTmrevReviewQuery,
	CreateTmrevReviewResponse,
	SingleReview,
	User,
	UserQuery,
	WatchList,
	MovieReviewPayload,
} from '@/models/tmrev';
import {
	BatchMoviesResponse,
	JustReviewed,
	MovieResponse,
	ReviewResponse,
	TopReviewed,
} from '@/models/tmrev/movie';
import {
	AllReviewsResponse,
	DeleteReviewQuery,
	GetUserMovieReviewsPayload,
	GetUserMovieReviewsResponse,
} from '@/models/tmrev/review';
import { SearchResponse } from '@/models/tmrev/search';
import { WatchedDeletePayload, WatchedPayload, WatchedResponse } from '@/models/tmrev/watched';
import { AddMovieToWatchList, GetListPayload, UpdateWatchList } from '@/models/tmrev/watchList';
import { IMovieQueryGeneral } from '@/models/tmdb/movie/tmdbMovie';
import { UpdateUserQuery } from '@/models/tmrev/user';

export const tmrevApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: TMREV_API_URL,
	}),
	endpoints: (builder) => ({
		addComment: builder.mutation<void, { id: string; comment: string; token: string }>({
			invalidatesTags: ['COMMENT', 'REVIEW', 'MOVIE'],
			query: (data) => ({
				body: {
					comment: data.comment,
				},
				headers: {
					authorization: data.token,
				},
				method: 'POST',
				url: `/movie/review/${data.id}/comment`,
			}),
		}),
		addMovieToWatchList: builder.mutation<void, AddMovieToWatchList>({
			invalidatesTags: ['WATCH_LIST'],
			query: (body) => ({
				body: body.data,
				headers: {
					authorization: body.token,
				},
				method: 'POST',
				url: `/watch-list/${body.listId}`,
			}),
		}),
		addTmrevReview: builder.mutation<CreateTmrevReviewResponse, CreateTmrevReviewQuery>({
			invalidatesTags: ['TMREV_SCORE', 'REVIEW', 'MOVIE'],
			query: (body) => {
				const newBody = structuredClone(body);
				delete newBody.token;

				return {
					body: newBody,
					headers: {
						authorization: body.token,
					},
					method: 'POST',
					url: '/movie/review/',
				};
			},
		}),
		batchLookUp: builder.query<BatchMoviesResponse, string[]>({
			query: (body) => ({
				body: {
					movieId: body,
				},
				method: 'POST',
				url: '/import/imdb',
			}),
		}),
		batchMovies: builder.query<BatchMoviesResponse, number[]>({
			query: (body) => ({
				body: {
					movieId: body,
				},
				method: 'POST',
				url: '/movie/batch',
			}),
		}),
		getUserMovieReviews: builder.query<GetUserMovieReviewsResponse, GetUserMovieReviewsPayload>({
			query: ({ query, userId }) => ({
				params: {
					...query,
				},
				url: `movie/user/review/${userId}`,
			}),
		}),
		categoryRatings: builder.query<CategoryDataResponse, string>({
			providesTags: ['REVIEW', 'MOVIE'],
			query: (uid) => ({
				url: `/user/${uid}/categoryRatings`,
			}),
		}),
		createWatchList: builder.mutation<WatchList, UpdateWatchList>({
			invalidatesTags: ['WATCH_LIST'],
			query: (body) => ({
				body: {
					description: body.description,
					movies: body.movies,
					public: body.public,
					tags: body.tags,
					title: body.title,
				},
				headers: {
					authorization: body.token,
				},
				method: 'POST',
				url: '/watch-list/',
			}),
		}),
		createWatched: builder.mutation<WatchedResponse, WatchedPayload>({
			invalidatesTags: ['WATCHED', 'MOVIE'],
			query: (body) => ({
				body: {
					liked: body.liked,
					posterPath: body.posterPath,
					title: body.title,
					tmdbID: body.tmdbID,
				},
				headers: {
					authorization: body.authToken,
				},
				method: 'POST',
				url: '/movie/watched',
			}),
		}),
		deleteTmrevReview: builder.mutation<void, DeleteReviewQuery>({
			invalidatesTags: ['MOVIE'],
			query: (body) => ({
				headers: {
					authorization: body.authToken,
				},
				method: 'DELETE',
				url: `/movie/review/${body.reviewId}`,
			}),
		}),
		deleteWatchList: builder.mutation<void, GetListPayload>({
			invalidatesTags: ['WATCH_LIST'],
			query: (body) => ({
				headers: {
					authorization: body.authToken,
				},
				method: 'DELETE',
				url: `/watch-list/${body.id}`,
			}),
		}),
		deleteWatched: builder.mutation<void, WatchedDeletePayload>({
			invalidatesTags: ['WATCHED', 'MOVIE'],
			query: (body) => ({
				headers: {
					authorization: body.authToken,
				},
				method: 'DELETE',
				url: `/movie/watched/${body.watchedId}`,
			}),
		}),
		followUser: builder.mutation<string, UserQuery>({
			invalidatesTags: ['USER'],
			query: (data) => ({
				headers: {
					authorization: data.authToken,
				},
				method: 'POST',
				url: `/user/follow/${data.uid}`,
			}),
		}),
		getAllReviews: builder.query<AllReviewsResponse, MovieReviewPayload>({
			providesTags: ['REVIEW', 'MOVIE', 'COMMENT'],
			query: ({ movie_id, query }) => ({
				params: {
					...query,
				},
				url: `/movie/reviews/${movie_id}`,
			}),
		}),
		getJustReviewed: builder.query<JustReviewed, void>({
			query: () => ({
				url: '/movie/just-reviewed',
			}),
		}),
		getList: builder.query<WatchList, GetListPayload>({
			providesTags: ['WATCH_LIST'],
			query: (body) => ({
				headers: {
					authorization: body.authToken,
				},
				url: `/watch-list/${body.id}`,
			}),
		}),
		getMovie: builder.query<MovieResponse, IMovieQueryGeneral>({
			providesTags: ['MOVIE'],
			query: (data) => ({
				url: `/movie/${data.movie_id}`,
			}),
		}),
		getSingleReview: builder.query<ReviewResponse, SingleReview>({
			query: (data) => ({
				headers: {
					authorization: data.authToken,
				},
				url: `/movie/review/${data.reviewId}`,
			}),
		}),
		getTopReviewed: builder.query<TopReviewed, void>({
			query: () => ({
				url: '/movie/top-reviewed',
			}),
		}),
		getUser: builder.query<User, UserQuery>({
			providesTags: ['USER', 'REVIEW', 'WATCHED', 'WATCH_LIST'],
			query: (data) => ({
				url: `/user/full/${data.uid}`,
			}),
			transformResponse: (response: User) => response,
		}),
		getUserWatchLists: builder.query<WatchList[], string>({
			providesTags: ['WATCH_LIST'],
			query: (data) => ({
				headers: {
					authorization: data,
				},
				url: '/watch-list',
			}),
		}),
		getWatched: builder.query<WatchedResponse, string>({
			providesTags: ['WATCHED', 'MOVIE'],
			query: (userId) => ({
				method: 'GET',
				url: `/movie/watched/${userId}`,
			}),
		}),
		readNotification: builder.mutation<void, IUpdateNotificationQuery>({
			invalidatesTags: ['NOTIFICATIONS'],
			query: ({ authToken, notificationId }) => ({
				headers: {
					authorization: authToken,
				},
				method: 'POST',
				url: `/notification/${notificationId}/read`,
			}),
		}),
		retrieveFollower: builder.query<RetrieveFollowerResponse, RetrieveFollowQuery>({
			providesTags: ['FOLLOW'],
			query: ({ accountId, ...params }) => ({
				params: {
					...params,
				},
				url: `/follow/${accountId}/followers`,
			}),
		}),
		retrieveFollowerFeed: builder.query<RetrieveFollowerFeedResponse, string>({
			providesTags: ['FOLLOW', 'REVIEW', 'MOVIE'],
			query: (accountId) => ({
				url: `/follow/${accountId}/feed`,
			}),
		}),
		retrieveFollowing: builder.query<RetrieveFollowingResponse, RetrieveFollowQuery>({
			providesTags: ['FOLLOW'],
			query: ({ accountId, ...params }) => ({
				params: {
					...params,
				},
				url: `/follow/${accountId}/following`,
			}),
		}),
		retrieveNotifications: builder.query<INotificationResponse, IRetrieveNotificationQuery>({
			providesTags: ['NOTIFICATIONS'],
			query: ({ authToken, params }) => ({
				headers: {
					authorization: authToken,
				},
				method: 'GET',
				params: {
					...params,
				},
				url: `/notification`,
			}),
		}),
		search: builder.query<SearchResponse, string>({
			query: (data) => ({
				url: `/search?q=${data}`,
			}),
		}),
		updateTmrevReview: builder.mutation<CreateTmrevReviewResponse, CreateTmrevReviewQuery>({
			invalidatesTags: ['MOVIE', 'COMMENT'],
			query: (body) => {
				const newBody = structuredClone(body);
				delete newBody.token;

				return {
					body: newBody,
					headers: {
						authorization: body.token,
					},
					method: 'PUT',
					url: `/movie/review/${newBody.tmdbID}`,
				};
			},
		}),
		updateWatchList: builder.mutation<WatchList, UpdateWatchList>({
			invalidatesTags: ['WATCH_LIST'],
			query: (body) => ({
				body: {
					description: body.description,
					movies: body.movies,
					public: body.public,
					tags: body.tags,
					title: body.title,
				},
				headers: {
					authorization: body.token,
				},
				method: 'PUT',
				url: `/watch-list/${body.watchListId}`,
			}),
		}),
		updateWatched: builder.mutation<WatchedResponse, WatchedPayload>({
			invalidatesTags: ['WATCHED', 'MOVIE'],
			query: (body) => ({
				body: {
					liked: body.liked,
					posterPath: body.posterPath,
					title: body.title,
					tmdbID: body.tmdbID,
				},
				headers: {
					authorization: body.authToken,
				},
				method: 'PUT',
				// eslint-disable-next-line no-underscore-dangle
				url: `/movie/watched/${body._id}`,
			}),
		}),
		updateUser: builder.mutation<User, UpdateUserQuery>({
			invalidatesTags: ['USER'],
			query: (data) => ({
				headers: {
					authorization: data.authToken,
				},
				body: {
					bio: data.bio,
					firstName: data.firstName,
					lastName: data.lastName,
					location: data.location,
				},
				method: 'PUT',
				url: `/user`,
			}),
		}),
		voteTmrevReview: builder.mutation<void, { vote: boolean; token: string; reviewId: string }>({
			invalidatesTags: ['COMMENT', 'REVIEW', 'MOVIE'],
			query: (data) => ({
				body: {
					vote: data.vote,
				},
				headers: {
					authorization: data.token,
				},
				method: 'POST',
				url: `/movie/review/vote/${data.reviewId}`,
			}),
		}),
	}),
	reducerPath: 'tmrevApi',
	tagTypes: [
		'MOVIE',
		'TMREV_SCORE',
		'WATCH_LIST',
		'WATCHED',
		'USER',
		'REVIEW',
		'COMMENT',
		'NOTIFICATIONS',
		'FOLLOW',
	],
});

export const {
	useAddTmrevReviewMutation,
	useGetMovieQuery,
	useGetUserQuery,
	useGetUserWatchListsQuery,
	useAddMovieToWatchListMutation,
	useUpdateWatchListMutation,
	useSearchQuery,
	useGetSingleReviewQuery,
	useUpdateTmrevReviewMutation,
	useDeleteTmrevReviewMutation,
	useBatchMoviesQuery,
	useCreateWatchedMutation,
	useDeleteWatchedMutation,
	useGetWatchedQuery,
	useUpdateWatchedMutation,
	useGetTopReviewedQuery,
	useGetJustReviewedQuery,
	useBatchLookUpQuery,
	useCreateWatchListMutation,
	useFollowUserMutation,
	useGetAllReviewsQuery,
	useGetListQuery,
	useDeleteWatchListMutation,
	useAddCommentMutation,
	useVoteTmrevReviewMutation,
	useCategoryRatingsQuery,
	useRetrieveNotificationsQuery,
	useReadNotificationMutation,
	useRetrieveFollowerQuery,
	useRetrieveFollowingQuery,
	useRetrieveFollowerFeedQuery,
	useUpdateUserMutation,
	useGetUserMovieReviewsQuery,
	util: { getRunningQueriesThunk },
} = tmrevApi;

export const { getMovie, batchMovies, getUser, getAllReviews, search } = tmrevApi.endpoints;
