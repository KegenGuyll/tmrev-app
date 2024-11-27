import { FromLocation } from '@/models';

const baseTabUrl = '/(tabs)';

export const allReviewsRoute = (from: FromLocation, profileId: string, advancedScore?: string) => {
	const baseUrl = `${baseTabUrl}/(${from})/profile/${profileId}/allReviews`;

	if (advancedScore) {
		return `${baseUrl}?from=${from}&advancedScore=${advancedScore}`;
	}

	return `${baseUrl}?from=${from}`;
};

export type FeedReviewContentTypes = 'comments' | 'reviews';

export type ReviewFunction = 'edit' | 'create';

export const feedReviewRoute = (
	reviewId: string,
	contentType: FeedReviewContentTypes,
	from: FromLocation
) => {
	return `${baseTabUrl}/(${from})/home/${reviewId}?contentType=${contentType}&from=${from}`;
};

export const feedReviewDetailsRoute = (
	postId: string,
	contentType: FeedReviewContentTypes,
	from: FromLocation
) => {
	return `${baseTabUrl}/(${from})/home/reply/${postId}?contentType=${contentType}&from=${from}`;
};

export const reviewFunctionRoute = (
	from: FromLocation,
	movieId: number,
	content: ReviewFunction,
	reviewId?: string
) => {
	return `${baseTabUrl}/(${from})/addReview/${movieId}?from=${from}&content=${content}&reviewId=${reviewId}`;
};

export const homeRoute = (from: FromLocation) => {
	return `${baseTabUrl}/(${from})/home?from=${from}`;
};

export const allListsRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/${profileId}/allLists?from=${from}`;
};

export const listDetailsRoute = (from: FromLocation, listId: string, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/list/${listId}?from=${from}&profileId=${profileId}`;
};

export const movieReviewsRoute = (from: FromLocation, movieId: string, movieTitle: string) => {
	return `${baseTabUrl}/(${from})/reviews/${movieId}?from=${from}&title=${movieTitle}`;
};

export const movieDetailsRoute = (from: FromLocation, movieId: string | number) => {
	return `${baseTabUrl}/(${from})/${movieId}?from=${from}`;
};

export const editProfileRoute = (from: FromLocation) => {
	return `${baseTabUrl}/(${from})/profile/editProfile?from=${from}`;
};

export const updatePinnedReviewsRoute = (from: FromLocation) => {
	return `${baseTabUrl}/(${from})/profile/updatePinnedReviews?from=${from}`;
};

export const profileSettingsRoute = (from: FromLocation, userId: string) => {
	return `${baseTabUrl}/(${from})/profile/${userId}/settings?from=${from}`;
};

export const profileSettingsNotificationsRoute = (from: FromLocation, userId: string) => {
	return `${baseTabUrl}/(${from})/profile/${userId}/settings/notifications?from=${from}`;
};

export const watchedMoviesRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/${profileId}/watchedMovies?from=${from}`;
};

export const personDetailsRoute = (from: FromLocation, personId: string) => {
	return `${baseTabUrl}/(${from})/person/${personId}?from=${from}`;
};

export const loggedInProfileRoute = (from: FromLocation) => {
	return `${baseTabUrl}/(${from})/profile?from=${from}`;
};

export const profileRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/${profileId}?from=${from}`;
};

export const profileFollowerRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/followers?userId=${profileId}&from=${from}`;
};

export const profileFollowingRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/following?userId=${profileId}&from=${from}`;
};

export const profileInsightNavigationRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/${profileId}/insights?from=${from}`;
};

export const createListRoute = (from: FromLocation, movieIds?: string, listId?: string) => {
	let url = `${baseTabUrl}/(${from})/profile/list/createList?movieIds=${movieIds}&from=${from}`;
	if (listId) {
		url += `&listId=${listId}`;
	}

	return url;
};

export const addToListRoute = (from: FromLocation, movieId: string) => {
	return `${baseTabUrl}/(${from})/profile/list/addToList/${movieId}?from=${from}`;
};

export const profileInsightGenreRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/${profileId}/insights/genre?from=${from}`;
};

export const actorInsightsRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/${profileId}/insights/actor?from=${from}`;
};

export const notificationsRoute = (from: FromLocation) =>
	`${baseTabUrl}/${from}/notifications?from=${from.replace('(', '').replace(')', '')}`;

export const loginRoute = () => '/login';

export const signupRoute = () => '/signup';
