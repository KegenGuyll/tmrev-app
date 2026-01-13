import { useInfiniteQuery } from '@tanstack/react-query';
import {
	commentControllerFindAll,
	getCommentControllerFindAllQueryKey,
} from '@/api/tmrev-api-v2/endpoints';

const DEFAULT_PAGE_SIZE = 20;

type UseCommentsOptions = {
	postId: string;
	pageSize?: number;
	enabled?: boolean;
};

/**
 * Hook to fetch comments with infinite scroll pagination.
 * Pass a Review ID to get top-level comments, or a Comment ID to get replies.
 */
const useComments = ({
	postId,
	pageSize = DEFAULT_PAGE_SIZE,
	enabled = true,
}: UseCommentsOptions) => {
	const query = useInfiniteQuery({
		queryKey: getCommentControllerFindAllQueryKey({ postId, pageSize }),
		queryFn: ({ pageParam = 1 }) =>
			commentControllerFindAll({
				postId,
				pageSize,
				pageNumber: pageParam,
			}),
		getNextPageParam: (lastPage) => {
			const currentPage = lastPage.pageNumber || 1;
			const totalPages = lastPage.totalNumberOfPages || 1;
			return currentPage < totalPages ? currentPage + 1 : undefined;
		},
		initialPageParam: 1,
		enabled: !!postId && enabled,
	});

	const comments = query.data?.pages.flatMap((page) => page.results || []) || [];
	const totalCount = query.data?.pages[0]?.totalCount || 0;

	return {
		...query,
		comments,
		totalCount,
	};
};

export default useComments;
