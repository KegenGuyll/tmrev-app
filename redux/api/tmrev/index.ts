/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { TMREV_API_URL } from '@env';
import auth from '@react-native-firebase/auth';
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
	CreatePinnedMoviePayload,
	GetPinnedMoviesResponse,
	JustReviewed,
	MovieResponse,
	PinnedMovieResponse,
	ReviewResponse,
	TopReviewed,
	UpdatePinnedMoviePayload,
} from '@/models/tmrev/movie';
import {
	AllReviewsResponse,
	DeleteReviewQuery,
	GetUserHighlightedReviewsResponse,
	GetUserMovieReviewsPayload,
	GetUserMovieReviewsResponse,
} from '@/models/tmrev/review';
import { SearchResponse } from '@/models/tmrev/search';
import {
	SingleWatchedQuery,
	SingleWatchedResponse,
	WatchedDeletePayload,
	WatchedPayload,
	WatchedQuery,
	WatchedResponse,
} from '@/models/tmrev/watched';
import {
	AddMovieToWatchList,
	CreateWatchList,
	GetListPayload,
	GetUserWatchListPayload,
	GetUserWatchListResponse,
	GetWatchListDetailsPayload,
	GetWatchListDetailsResponse,
	UpdateWatchList,
} from '@/models/tmrev/watchList';
import { IMovieQueryGeneral } from '@/models/tmdb/movie/tmdbMovie';
import {
	FollowUserV2Payload,
	FollowUserV2Response,
	GetFollowPayload,
	GetFollowResponse,
	GetUserV2Payload,
	GetUserV2Response,
	UpdateUserQuery,
} from '@/models/tmrev/user';
import { MovieGenreInsightResponse } from '@/models/tmrev/insights';

export const tmrevApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: TMREV_API_URL,
		prepareHeaders: async (headers) => {
			const { currentUser } = auth();

			if (currentUser) {
				const token = await currentUser.getIdToken();

				headers.set('Authorization', token);
			}

			return headers;
		},
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
				return {
					body,
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
				url: `movie/v2/user/review/${userId}`,
			}),
			serializeQueryArgs: ({ queryArgs }) => {
				const refetchQueries = { ...queryArgs.query, userId: queryArgs.userId };

				delete refetchQueries.pageNumber;

				return {
					...refetchQueries,
				};
			},
			merge: (currentCache, newItems) => {
				// make sure there isn't duplicate data being added
				const newData = [...currentCache.body.reviews, ...newItems.body.reviews];

				// remove duplicates
				const uniqueData = newData.filter((v, i, a) => a.findIndex((t) => t._id === v._id) === i);

				// Merge the new items into the cache
				currentCache.body.reviews = uniqueData;
			},
			// Refetch when the page arg changes
			forceRefetch({ currentArg, previousArg }) {
				return currentArg?.query?.pageNumber !== previousArg?.query?.pageNumber;
			},
		}),
		getUserHighlightedReviews: builder.query<GetUserHighlightedReviewsResponse, string>({
			providesTags: ['REVIEW', 'MOVIE'],
			query: (userId) => ({
				url: `/user/${userId}/ratedMovies`,
			}),
		}),
		getFollowingV2: builder.query<GetFollowResponse, GetFollowPayload>({
			query: (data) => ({
				url: `/user/v2/following/${data.uid}`,
				params: {
					...data.query,
				},
			}),
		}),
		getFollowersV2: builder.query<GetFollowResponse, GetFollowPayload>({
			query: (data) => ({
				url: `/user/v2/followers/${data.uid}`,
				params: {
					...data.query,
				},
			}),
		}),
		categoryRatings: builder.query<CategoryDataResponse, string>({
			providesTags: ['REVIEW', 'MOVIE'],
			query: (uid) => ({
				url: `/user/${uid}/categoryRatings`,
			}),
		}),
		createWatchList: builder.mutation<WatchList, CreateWatchList>({
			invalidatesTags: ['WATCH_LIST'],
			query: (body) => ({
				body: {
					description: body.description,
					movies: body.movies,
					public: body.public,
					tags: body.tags,
					title: body.title,
				},
				method: 'POST',
				url: '/watch-list/',
			}),
		}),
		getUserWatchLists: builder.query<GetUserWatchListResponse, GetUserWatchListPayload>({
			providesTags: ['WATCH_LIST'],
			query: (data) => {
				const newData = { ...data };

				delete newData.userId;

				return {
					params: {
						...data,
					},
					url: `/movie/v2/user/${data.userId}/watchlist`,
				};
			},
			serializeQueryArgs: ({ queryArgs }) => {
				const refetchQueries = { ...queryArgs };

				// @ts-expect-error
				delete refetchQueries.pageNumber;

				return {
					...refetchQueries,
				};
			},
			merge: (currentCache, newItems) => {
				// make sure there isn't duplicate data being added
				const newData = [...currentCache.body.watchlists, ...newItems.body.watchlists];

				// remove duplicates
				const uniqueData = newData.filter((v, i, a) => a.findIndex((t) => t._id === v._id) === i);

				// Merge the new items into the cache
				currentCache.body.watchlists = uniqueData;
			},
			// Refetch when the page arg changes
			forceRefetch({ currentArg, previousArg }) {
				return currentArg?.pageNumber !== previousArg?.pageNumber;
			},
		}),
		getWatchListDetails: builder.query<GetWatchListDetailsResponse, GetWatchListDetailsPayload>({
			providesTags: ['WATCH_LIST'],
			query: (body) => ({
				url: `/movie/v2/user/watchlist/${body.listId}`,
			}),
		}),
		createWatched: builder.mutation<WatchedResponse, WatchedPayload>({
			invalidatesTags: ['WATCHED', 'MOVIE'],
			query: (body) => ({
				body: {
					liked: body.liked,
					tmdbID: body.tmdbID,
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
		followUserV2: builder.mutation<FollowUserV2Response, FollowUserV2Payload>({
			invalidatesTags: ['USER'],
			query: (data) => ({
				method: 'POST',
				url: `/user/v2/follow/${data.userUid}`,
			}),
		}),
		unfollowUserV2: builder.mutation<FollowUserV2Response, FollowUserV2Payload>({
			invalidatesTags: ['USER'],
			query: (data) => ({
				method: 'POST',
				url: `/user/v2/unfollow/${data.userUid}`,
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
		getV2User: builder.query<GetUserV2Response, GetUserV2Payload>({
			providesTags: ['USER', 'FOLLOW', 'REVIEW', 'MOVIE', 'WATCHED', 'WATCH_LIST'],
			query: (data) => ({
				url: `/user/v2/${data.uid}`,
			}),
		}),
		getWatched: builder.query<WatchedResponse, WatchedQuery>({
			providesTags: ['WATCHED', 'MOVIE'],
			query: ({ userId, query }) => ({
				method: 'GET',
				params: {
					...query,
				},
				url: `/movie/watched/${userId}`,
			}),
			serializeQueryArgs: ({ queryArgs }) => {
				const refetchQueries = { ...queryArgs.query, userId: queryArgs.userId };

				// @ts-expect-error
				delete refetchQueries.pageNumber;

				return {
					...refetchQueries,
				};
			},
			merge: (currentCache, newItems) => {
				// make sure there isn't duplicate data being added
				const newData = [...currentCache.body.watched, ...newItems.body.watched];

				// remove duplicates
				const uniqueData = newData.filter((v, i, a) => a.findIndex((t) => t._id === v._id) === i);

				// Merge the new items into the cache
				currentCache.body.watched = uniqueData;
			},
			// Refetch when the page arg changes
			forceRefetch({ currentArg, previousArg }) {
				return currentArg?.query?.pageNumber !== previousArg?.query?.pageNumber;
			},
		}),
		getSingleWatched: builder.query<SingleWatchedResponse, SingleWatchedQuery>({
			providesTags: ['WATCHED', 'MOVIE'],
			query: ({ userId, tmdbID }) => ({
				method: 'GET',
				url: `/movie/watched/${userId}/${tmdbID}`,
			}),
		}),
		getGenreInsights: builder.query<MovieGenreInsightResponse, string>({
			query: (userId) => ({
				url: `/movie/genre/insights/${userId}`,
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
				return {
					body,
					method: 'PUT',
					url: `/movie/review/${body.tmdbID}`,
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
				method: 'PUT',
				url: `/watch-list/${body.watchListId}`,
			}),
		}),
		updateWatched: builder.mutation<WatchedResponse, WatchedPayload>({
			invalidatesTags: ['WATCHED', 'MOVIE'],
			query: (body) => ({
				body: {
					liked: body.liked,
					tmdbID: body.tmdbID,
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
		getPinnedMovies: builder.query<GetPinnedMoviesResponse, string>({
			providesTags: ['PINNED'],
			query: (userId) => ({
				url: `/movie/v2/pinned/${userId}`,
			}),
		}),
		createPinnedMovie: builder.mutation<PinnedMovieResponse, CreatePinnedMoviePayload>({
			invalidatesTags: ['PINNED'],
			query: ({ movieReviewId }) => ({
				body: {
					movieReviewId,
				},
				method: 'POST',
				url: '/movie/v2/pinned',
			}),
		}),
		updatePinnedMovie: builder.mutation<PinnedMovieResponse, UpdatePinnedMoviePayload>({
			invalidatesTags: ['PINNED'],
			query: ({ movieReviewIds }) => ({
				body: {
					movieReviewIds,
				},
				method: 'PUT',
				url: '/movie/v2/pinned',
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
		'PINNED',
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
	useGetV2UserQuery,
	useFollowUserV2Mutation,
	useUnfollowUserV2Mutation,
	useGetFollowersV2Query,
	useGetFollowingV2Query,
	useGetUserHighlightedReviewsQuery,
	useGetPinnedMoviesQuery,
	useCreatePinnedMovieMutation,
	useUpdatePinnedMovieMutation,
	useGetWatchListDetailsQuery,
	useGetGenreInsightsQuery,
	useGetSingleWatchedQuery,
	util: { getRunningQueriesThunk },
} = tmrevApi;

export const { getMovie, batchMovies, getUser, getAllReviews, search } = tmrevApi.endpoints;
