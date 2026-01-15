import { NotificationContentType } from '@/api/tmrev-api-v2';
import { FromLocation } from '@/models';

const baseTabUrl = '/(tabs)';

export const allReviewsRoute = (from: FromLocation, profileId: string, advancedScore?: string) => {
	const baseUrl = `${baseTabUrl}/profile/${profileId}/allReviews`;

	if (advancedScore) {
		return `${baseUrl}?from=${from}&advancedScore=${advancedScore}`;
	}

	return `${baseUrl}?from=${from}`;
};

export type FeedReviewContentTypes = NotificationContentType;

export type ReviewFunction = 'edit' | 'create';

export const feedReviewRoute = (
	reviewId: string,
	contentType: NotificationContentType,
	from: FromLocation
) => {
	return `${baseTabUrl}/home/${reviewId}?contentType=${contentType}&from=${from}`;
};

export const feedReviewDetailsRoute = (
	postId: string,
	contentType: NotificationContentType,
	from: FromLocation
) => {
	return `${baseTabUrl}/home/reply/${postId}?contentType=${contentType}&from=${from}`;
};

export const reviewFunctionRoute = (
	from: FromLocation,
	movieId: number,
	content: ReviewFunction,
	reviewId?: string
) => {
	return `${baseTabUrl}/addReview/${movieId}?from=${from}&content=${content}&reviewId=${reviewId}`;
};

export const homeRoute = (from: FromLocation) => {
	return `${baseTabUrl}/home?from=${from}`;
};

export const allListsRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/profile/${profileId}/allLists?from=${from}`;
};

export const listDetailsRoute = (from: FromLocation, listId: string, profileId: string) => {
	return `${baseTabUrl}/profile/list/${listId}?from=${from}&profileId=${profileId}`;
};

export const movieReviewsRoute = (from: FromLocation, movieId: string, movieTitle: string) => {
	return `${baseTabUrl}/reviews/${movieId}?from=${from}&title=${movieTitle}`;
};

export const movieDetailsRoute = (from: FromLocation, movieId: string | number) => {
	return `${baseTabUrl}/${movieId}?from=${from}`;
};

export const editProfileRoute = (from: FromLocation) => {
	return `${baseTabUrl}/profile/editProfile?from=${from}`;
};

export const updatePinnedReviewsRoute = (from: FromLocation) => {
	return `${baseTabUrl}/profile/updatePinnedReviews?from=${from}`;
};

export const profileSettingsRoute = (from: FromLocation, userId: string) => {
	return `${baseTabUrl}/profile/${userId}/settings?from=${from}`;
};

export const profileSettingsNotificationsRoute = (from: FromLocation, userId: string) => {
	return `${baseTabUrl}/profile/${userId}/settings/notifications?from=${from}`;
};

export const watchedMoviesRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/profile/${profileId}/watchedMovies?from=${from}`;
};

export const personDetailsRoute = (from: FromLocation, personId: string) => {
	return `${baseTabUrl}/person/${personId}?from=${from}`;
};

export const loggedInProfileRoute = (from: FromLocation) => {
	return `${baseTabUrl}/profile?from=${from}`;
};

export const profileRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/profile/${profileId}?from=${from}`;
};

export const profileFollowerRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/profile/followers?userId=${profileId}&from=${from}`;
};

export const profileFollowingRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/profile/following?userId=${profileId}&from=${from}`;
};

export const profileInsightNavigationRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/profile/${profileId}/insights?from=${from}`;
};

export const createListRoute = (from: FromLocation, movieIds?: string, listId?: string) => {
	let url = `${baseTabUrl}/profile/list/createList?from=${from}`;
	if (movieIds) {
		url += `&movieIds=${movieIds}`;
	}
	if (listId) {
		url += `&listId=${listId}`;
	}

	return url;
};

export const addToListRoute = (from: FromLocation, movieId: string) => {
	return `${baseTabUrl}/profile/list/addToList?movieId=${movieId}&from=${from}`;
};

export const profileInsightGenreRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/profile/${profileId}/insights/genre?from=${from}`;
};

export const actorInsightsRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/profile/${profileId}/insights/actor?from=${from}`;
};

export const notificationsRoute = (from: FromLocation) =>
	`${baseTabUrl}/notifications?from=${from}`;

export const loginRoute = () => '/login';

export const signupRoute = () => '/signup';
