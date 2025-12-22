import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import {
	getWatchedControllerFindByUserIdQueryKey,
	useWatchedControllerCreate,
	useWatchedControllerFindOneByUserAndTmdbId,
	useWatchedControllerUpdate,
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

	const { mutateAsync: updateWatched } = useWatchedControllerUpdate();
	const { mutateAsync: createWatched } = useWatchedControllerCreate();

	const { data: singleWatched } = useWatchedControllerFindOneByUserAndTmdbId(
		currentUser?.uid || '',
		Number(movieId!),
		{
			query: { enabled: !!currentUser && !!movieId },
		}
	);

	useEffect(() => {
		if (singleWatched) {
			setHasWatched(true);
			if (singleWatched.liked) {
				setHasLiked(true);
			}
		}
	}, [singleWatched]);

	const handleOnPress = async (liked: boolean) => {
		if (!currentUser) {
			if (setLoginMessage) {
				setLoginMessage(likeMovieLoginPrompt);
			}
			return;
		}

		try {
			if (hasWatched && singleWatched) {
				await updateWatched({
					id: singleWatched._id,
					data: {
						liked,
					},
				});
				setHasLiked(liked);
			} else {
				await createWatched({
					data: {
						liked,
						tmdbId: Number(movieId),
					},
				});
				setHasLiked(liked);
				setHasWatched(true);
			}

			await queryClient.invalidateQueries({
				queryKey: getWatchedControllerFindByUserIdQueryKey(currentUser.uid),
			});
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
