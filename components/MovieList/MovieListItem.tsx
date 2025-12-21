/* eslint-disable react/no-array-index-key */
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { GestureResponderEvent, StyleProp, View, ViewStyle } from 'react-native';
import { TouchableRipple, Surface, Text } from 'react-native-paper';
import { FromLocation } from '@/models';
import { listDetailsRoute } from '@/constants/routes';
import { MoviePosterImage } from '../MoviePoster';
import { WatchlistAggregated } from '@/api/tmrev-api-v2';

type WatchListItemProps = {
	item: WatchlistAggregated;
	onPress?: (e: GestureResponderEvent) => void;
	profileId?: string;
	from?: FromLocation;
	style?: StyleProp<ViewStyle>;
	touchableRippleStyle?: StyleProp<ViewStyle>;
};

const MovieListItem: React.FC<WatchListItemProps> = ({
	item,
	from,
	profileId,
	onPress,
	style,
	touchableRippleStyle,
}: WatchListItemProps) => {
	const firstFiveMovies = useMemo(() => item.movies.slice(0, 5), [item.movies]);
	const router = useRouter();

	const handleOnPress = (e: GestureResponderEvent) => {
		if (onPress) {
			onPress(e);
		} else if (profileId && from) {
			router.navigate(listDetailsRoute(from, item._id, profileId));
		}
	};

	return (
		<TouchableRipple style={touchableRippleStyle} onPress={handleOnPress}>
			<Surface style={[{ padding: 8, borderRadius: 4 }, style]}>
				<View style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
					<View>
						<Text variant="labelLarge">{item.title}</Text>
						<Text variant="labelSmall">{`${item.movies.length} movies`}</Text>
					</View>

					<View style={{ display: 'flex', flexDirection: 'row' }}>
						{firstFiveMovies.map((movie, index) => (
							// keep an eye on this shadow, it may be causing performance issues
							// <Shadow
							// 	key={`${movie.id}-${index}`}
							// 	distance={2}
							// 	offset={[-5, 0]}
							// 	style={{
							// 		marginRight: -10,
							// 	}}
							// >
							<MoviePosterImage
								key={`${movie.id}-${index}`}
								style={{ borderWidth: 0, marginRight: -12 }}
								height={110}
								width={73}
								moviePoster={movie.poster_path}
								posterSize={154}
							/>
							// </Shadow>
						))}
					</View>
				</View>
			</Surface>
		</TouchableRipple>
	);
};

export default MovieListItem;
