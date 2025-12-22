import { Image, Linking, View } from 'react-native';
import { Divider, Text, TouchableRipple } from 'react-native-paper';
import { MovieBuy } from '@/models/tmdb/movie/movieWatchProviders';
import imageUrl from '@/utils/imageUrl';
import MoviePoster from '../MoviePoster';
import { FromLocation } from '@/models';
import { WatchlistMovieAggregated } from '@/api/tmrev-api-v2/schemas/watchlistMovieAggregated';

type WatchProviderItemProps = {
	link?: string;
	availableFlatrates: Record<string, MovieBuy>;
	items: { [key: string]: WatchlistMovieAggregated[] };
	from: FromLocation;
};

const WatchProviderItem: React.FC<WatchProviderItemProps> = ({
	items,
	availableFlatrates,
	from,
	link,
}: WatchProviderItemProps) => {
	const handleOpenLink = () => {
		if (link) {
			Linking.openURL(link);
		}
	};

	return (
		<View
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 8,
				width: '100%',
			}}
		>
			{Object.keys(items).map((key) => (
				<View style={{ display: 'flex', flexDirection: 'column', gap: 4 }} key={key}>
					<TouchableRipple onPress={handleOpenLink}>
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: 4,
								width: '100%',
								alignItems: 'center',
							}}
						>
							{availableFlatrates[key].logo_path && (
								<Image
									source={{ uri: imageUrl(availableFlatrates[key].logo_path) }}
									style={{ width: 40, height: 40, borderRadius: 4 }}
								/>
							)}

							<Text variant="labelLarge">{availableFlatrates[key].provider_name}</Text>
						</View>
					</TouchableRipple>

					<View style={{ display: 'flex', flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
						{items[key].map((movie) => (
							<View key={movie.id}>
								<MoviePoster
									location={from}
									movieId={movie.id}
									moviePoster={movie.poster_path}
									height={100}
								/>
							</View>
						))}
					</View>
					<Divider style={{ marginVertical: 8 }} />
				</View>
			))}
		</View>
	);
};

export default WatchProviderItem;
