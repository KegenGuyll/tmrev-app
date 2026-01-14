import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import {
	getWatchedControllerFindByUserIdQueryKey,
	getWatchedControllerGetMovieStatsQueryKey,
	getWatchedControllerGetWatchedStatusQueryKey,
	useWatchedControllerCreate,
	useWatchedControllerGetWatchedStatus,
	useWatchedControllerUpdate,
	WatchlistAggregatedDetail,
} from '@/api/tmrev-api-v2';
import { likeMovieLoginPrompt } from '@/constants/messages';

type WatchedMovieProps = {
	likes: number;
	dislikes: number;
	movieId: number;
	setLoginMessage?: (message: string | null) => void;
};

const WatchedMovie: React.FC<WatchedMovieProps> = ({
	likes,
	dislikes,
	movieId,
	setLoginMessage,
}: WatchedMovieProps) => {
	const { currentUser } = useAuth({});
	const [hasWatched, setHasWatched] = useState(false);
	const [hasLiked, setHasLiked] = useState(false);

	const queryClient = useQueryClient();

	const invalidateQueries = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: getWatchedControllerGetMovieStatsQueryKey(movieId),
			}),
			queryClient.invalidateQueries({
				queryKey: getWatchedControllerGetWatchedStatusQueryKey(movieId),
			}),
			queryClient.invalidateQueries({
				queryKey: getWatchedControllerFindByUserIdQueryKey(currentUser?.uid || ''),
				exact: false,
			}),
			queryClient.invalidateQueries({
				predicate: (query) => {
					const [key] = query.queryKey;
					if (typeof key !== 'string') return false;

					// Handle individual list details
					if (key.startsWith('/watch-list/')) {
						const data: WatchlistAggregatedDetail | undefined = queryClient.getQueryData(
							query.queryKey
						);

						if (!data) return false;

						// Check if this specific list object contains the movieId
						const foundMovieInList = data?.movies?.some((m) => m.id === movieId);
						return foundMovieInList;
					}

					return false;
				},
			}),
		]);
	};

	const { mutateAsync: updateWatched } = useWatchedControllerUpdate({
		mutation: {
			onSuccess: () => {
				invalidateQueries();
			},
		},
	});
	const { mutateAsync: createWatched } = useWatchedControllerCreate({
		mutation: {
			onSuccess: () => {
				invalidateQueries();
			},
		},
	});

	const { data: watchedStatus } = useWatchedControllerGetWatchedStatus(Number(movieId!), {
		query: { enabled: !!movieId },
	});

	useEffect(() => {
		if (watchedStatus) {
			setHasWatched(true);
			if (watchedStatus.liked) {
				setHasLiked(true);
			}
		}
	}, [watchedStatus]);
	const handleOnPress = async (liked: boolean) => {
		if (!currentUser) {
			if (setLoginMessage) {
				setLoginMessage(likeMovieLoginPrompt);
			}
			return;
		}

		try {
			if (hasWatched && watchedStatus && watchedStatus._id) {
				await updateWatched({
					id: watchedStatus._id,
					data: {
						liked,
					},
				});
				setHasLiked(liked);
			} else {
				await createWatched({
					data: {
						liked,
						tmdbID: Number(movieId),
					},
				});
				setHasLiked(liked);
				setHasWatched(true);
			}
		} catch (error) {
			// error
		}
	};

	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
				<IconButton
					onPress={() => handleOnPress(true)}
					icon={hasWatched && hasLiked ? 'thumb-up' : 'thumb-up-outline'}
				/>
				<Text>{likes}</Text>
			</View>
			<View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
				<IconButton
					onPress={() => handleOnPress(false)}
					icon={hasWatched && !hasLiked ? 'thumb-down' : 'thumb-down-outline'}
				/>
				<Text>{dislikes}</Text>
			</View>
		</View>
	);
};

export default WatchedMovie;
