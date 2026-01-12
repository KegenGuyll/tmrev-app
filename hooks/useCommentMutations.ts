import { useQueryClient } from '@tanstack/react-query';
import {
	useCommentControllerCreate,
	useCommentControllerVote,
	useCommentControllerRemove,
	getCommentControllerFindAllQueryKey,
	getFeedControllerGetFeedQueryKey,
} from '@/api/tmrev-api-v2/endpoints';
import { VoteCommentDtoClassVoteType, CommentPostType } from '@/api/tmrev-api-v2';

type CreateCommentParams = {
	comment: string;
	postId: string;
	postType: CommentPostType;
	authorId: string;
};

type VoteCommentParams = {
	commentId: string;
	voteType: VoteCommentDtoClassVoteType;
};

type DeleteCommentParams = {
	commentId: string;
};

/**
 * Hook providing comment mutation operations with automatic cache invalidation.
 * @param postId - The parent post ID to invalidate queries for after mutations
 */
const useCommentMutations = (postId?: string) => {
	const queryClient = useQueryClient();

	const invalidateComments = () => {
		if (postId) {
			queryClient.invalidateQueries({
				queryKey: getCommentControllerFindAllQueryKey({ postId }),
			});
		}
	};

	const invalidateFeed = () => {
		queryClient.invalidateQueries({ queryKey: getFeedControllerGetFeedQueryKey() });
	};

	const invalidateAll = async () => {
		await Promise.all([invalidateComments(), invalidateFeed()]);
	};

	const createMutation = useCommentControllerCreate({
		mutation: {
			onSuccess: async () => {
				await invalidateAll();
			},
		},
	});

	const voteMutation = useCommentControllerVote({
		mutation: {
			onSuccess: async () => {
				await invalidateAll();
			},
		},
	});

	const removeMutation = useCommentControllerRemove({
		mutation: {
			onSuccess: async () => {
				await invalidateAll();
			},
		},
	});

	const createComment = async ({
		comment,
		authorId,
		postId: targetPostId,
		postType,
	}: CreateCommentParams) => {
		return createMutation.mutateAsync({
			data: {
				comment,
				post: {
					author: authorId,
					id: targetPostId,
					type: postType,
				},
			},
		});
	};

	const voteComment = async ({ commentId, voteType }: VoteCommentParams) => {
		return voteMutation.mutateAsync({
			id: commentId,
			data: { voteType },
		});
	};

	const deleteComment = async ({ commentId }: DeleteCommentParams) => {
		return removeMutation.mutateAsync({ id: commentId });
	};

	return {
		createComment,
		voteComment,
		deleteComment,
		isCreating: createMutation.isPending,
		isVoting: voteMutation.isPending,
		isDeleting: removeMutation.isPending,
	};
};

export default useCommentMutations;
