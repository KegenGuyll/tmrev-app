import { FromLocation } from '@/models';

const baseTabUrl = '/(tabs)';

export const allReviewsRoute = (from: FromLocation, profileId: string, advancedScore?: string) => {
	const baseUrl = `${baseTabUrl}/(${from})/profile/${profileId}/allReviews`;

	if (advancedScore) {
		return `${baseUrl}?from=${from}&advancedScore=${advancedScore}`;
	}

	return `${baseUrl}?from=${from}`;
};

export const feedReviewRoute = (reviewId: string) => {
	return `${baseTabUrl}/(home)/home/${reviewId}`;
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

export const watchedMoviesRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/${profileId}/watchedMovies?from=${from}`;
};

export const personDetailsRoute = (from: FromLocation, personId: string) => {
	return `${baseTabUrl}/(${from})/person/${personId}?from=${from}`;
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

export const profileInsightGenreRoute = (from: FromLocation, profileId: string) => {
	return `${baseTabUrl}/(${from})/profile/${profileId}/insights/genre?from=${from}`;
};

export const loginRoute = () => '/login';

export const signupRoute = () => '/signup';
