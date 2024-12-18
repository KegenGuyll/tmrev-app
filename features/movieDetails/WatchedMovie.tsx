import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import useAuth from '@/hooks/useAuth';
import {
	useCreateWatchedMutation,
	useGetSingleWatchedQuery,
	useUpdateWatchedMutation,
} from '@/redux/api/tmrev';
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

	const [updateWatched] = useUpdateWatchedMutation();
	const [createWatched] = useCreateWatchedMutation();

	const { data: singleWatched } = useGetSingleWatchedQuery(
		{ userId: currentUser?.uid || '', tmdbID: Number(movieId!) },
		{ skip: !currentUser || !movieId }
	);

	useEffect(() => {
		if (singleWatched?.body) {
			setHasWatched(true);
			if (singleWatched.body.liked) {
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

		if (hasWatched && singleWatched?.body) {
			await updateWatched({
				tmdbID: Number(movieId),
				liked,
				_id: singleWatched?.body?._id,
			}).unwrap();
			setHasLiked(liked);
		} else {
			await createWatched({
				liked,
				tmdbID: Number(movieId),
			}).unwrap();
			setHasLiked(liked);
			setHasWatched(true);
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
