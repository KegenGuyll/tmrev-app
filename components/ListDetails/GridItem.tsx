import { View } from 'react-native';
import { Icon } from 'react-native-paper';
import React from 'react';
import MoviePoster from '../MoviePoster';
import { FromLocation } from '@/models';
import { WatchlistMovieAggregated } from '@/api/tmrev-api-v2/schemas/watchlistMovieAggregated';

type ListGridItemProps = {
	item: WatchlistMovieAggregated;
	from: FromLocation;
	index: number;
	selectedMovie: {
		position: number;
		details: WatchlistMovieAggregated | null;
	} | null;
	setSelectedMovie: (movie: { position: number; details: WatchlistMovieAggregated }) => void;
	handleLongPress: (movie: WatchlistMovieAggregated) => void;
};

const ListGridItem: React.FC<ListGridItemProps> = ({
	item,
	from,
	selectedMovie,
	setSelectedMovie,
	handleLongPress,
	index,
}: ListGridItemProps) => {
	return (
		<MoviePoster
			height={120}
			movieId={item.id}
			location={from!}
			moviePoster={item.poster_path}
			rankedPosition={index + 1}
			overlayComponent={
				item.reviewCount > 0 && (
					<View
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 999,
						}}
					>
						<View
							// eslint-disable-next-line react-native/no-color-literals
							style={{
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								backgroundColor: 'rgba(0,0,0,0.7)',
								borderRadius: 25,
								zIndex: 999,
								height: 50,
								width: 50,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Icon size={25} source="eye" />
						</View>
					</View>
				)
			}
			onPress={
				selectedMovie ? () => setSelectedMovie({ position: index, details: item }) : undefined
			}
			onLongPress={() => handleLongPress(item)}
		/>
	);
};

export default ListGridItem;
