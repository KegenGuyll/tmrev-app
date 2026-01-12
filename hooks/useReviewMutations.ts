import { useQueryClient } from '@tanstack/react-query';
import {
	useReviewControllerAddUpVote,
	useReviewControllerRemoveUpVote,
	useReviewControllerAddDownVote,
	useReviewControllerRemoveDownVote,
	getReviewControllerFindOneQueryKey,
	getFeedControllerGetFeedQueryKey,
	getReviewControllerFindByTmdbIdQueryKey,
} from '@/api/tmrev-api-v2/endpoints';

type VoteReviewParams = {
	reviewId: string;
};

/**
 * Hook providing review mutation operations with automatic cache invalidation.
 * Handles upvoting, downvoting, and unvoting reviews.
 */
const useReviewMutations = () => {
	const queryClient = useQueryClient();

	const invalidateReviewQueries = (reviewId?: string) => {
		// Invalidate the specific review
		if (reviewId) {
			queryClient.invalidateQueries({
				queryKey: getReviewControllerFindOneQueryKey(reviewId),
			});
		}

		// Invalidate all review lists (by tmdbId, userId, etc.)
		queryClient.invalidateQueries({
			queryKey: getReviewControllerFindByTmdbIdQueryKey(),
		});

		// Invalidate feed
		queryClient.invalidateQueries({
			queryKey: getFeedControllerGetFeedQueryKey(),
		});
	};

	const addUpVoteMutation = useReviewControllerAddUpVote({
		mutation: {
			onSuccess: async (_, variables) => {
				await invalidateReviewQueries(variables.id);
			},
		},
	});

	const removeUpVoteMutation = useReviewControllerRemoveUpVote({
		mutation: {
			onSuccess: async (_, variables) => {
				await invalidateReviewQueries(variables.id);
			},
		},
	});

	const addDownVoteMutation = useReviewControllerAddDownVote({
		mutation: {
			onSuccess: async (_, variables) => {
				await invalidateReviewQueries(variables.id);
			},
		},
	});

	const removeDownVoteMutation = useReviewControllerRemoveDownVote({
		mutation: {
			onSuccess: async (_, variables) => {
				await invalidateReviewQueries(variables.id);
			},
		},
	});

	const voteUp = async ({ reviewId }: VoteReviewParams) => {
		return addUpVoteMutation.mutateAsync({ id: reviewId });
	};

	const removeUp = async ({ reviewId }: VoteReviewParams) => {
		return removeUpVoteMutation.mutateAsync({ id: reviewId });
	};

	const voteDown = async ({ reviewId }: VoteReviewParams) => {
		return addDownVoteMutation.mutateAsync({ id: reviewId });
	};

	const removeDown = async ({ reviewId }: VoteReviewParams) => {
		return removeDownVoteMutation.mutateAsync({ id: reviewId });
	};

	return {
		voteUp,
		removeUp,
		voteDown,
		removeDown,
		isVotingUp: addUpVoteMutation.isPending || removeUpVoteMutation.isPending,
		isVotingDown: addDownVoteMutation.isPending || removeDownVoteMutation.isPending,
	};
};

export default useReviewMutations;
