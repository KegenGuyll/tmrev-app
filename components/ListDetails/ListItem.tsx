import { View } from 'react-native';
import { Surface, IconButton, Text } from 'react-native-paper';
import { MoviePosterImage } from '../MoviePoster';
import { GetWatchListMovie } from '@/models/tmrev/watchList';

type ListMovieItemProps = {
	item: GetWatchListMovie;
	index: number;
	handleMoveUpInRank: (index: number) => void;
	handleMoveDownInRank: (index: number) => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
	isCurrentUser?: boolean;
};

const ListDetailItem: React.FC<ListMovieItemProps> = ({
	item,
	index,
	handleMoveDownInRank,
	handleMoveUpInRank,
	canMoveUp,
	canMoveDown,
	isCurrentUser,
}: ListMovieItemProps) => {
	return (
		<Surface style={{ padding: 8, borderRadius: 4 }}>
			<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 32 }}>
				<View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					{isCurrentUser && (
						<IconButton
							disabled={canMoveUp}
							onPress={() => handleMoveUpInRank(index)}
							icon="arrow-up-thick"
						/>
					)}
					<Text variant="bodyLarge">{index + 1}</Text>
					{isCurrentUser && (
						<IconButton
							disabled={canMoveDown}
							onPress={() => handleMoveDownInRank(index)}
							icon="arrow-down-thick"
						/>
					)}
				</View>
				<View style={{ gap: 8 }}>
					<Text ellipsizeMode="tail" numberOfLines={1} style={{ width: 250 }} variant="labelLarge">
						{item.title}
					</Text>
					<MoviePosterImage moviePoster={item.poster_path} height={100} posterSize={154} />
				</View>
			</View>
		</Surface>
	);
};

export default ListDetailItem;
