import { FromLocation } from '@/models';

export const allReviewsRoute = (from: FromLocation, profileId: string, advancedScore?: string) => {
	const baseUrl = `/(tabs)/(${from})/profile/${profileId}/allReviews`;

	if (advancedScore) {
		return `${baseUrl}?from=${from}&advancedScore=${advancedScore}`;
	}

	return `${baseUrl}?from=${from}`;
};
