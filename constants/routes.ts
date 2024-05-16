import { FromLocation } from '@/models';

const baseTabUrl = '/(tabs)';

export const allReviewsRoute = (from: FromLocation, profileId: string, advancedScore?: string) => {
	const baseUrl = `${baseTabUrl}/(${from})/profile/${profileId}/allReviews`;

	if (advancedScore) {
		return `${baseUrl}?from=${from}&advancedScore=${advancedScore}`;
	}

	return `${baseUrl}?from=${from}`;
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

export const loginRoute = () => '/login';

export const signupRoute = () => '/signup';