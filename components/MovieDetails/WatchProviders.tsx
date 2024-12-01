import { useEffect, useMemo, useState } from 'react';
import { Linking, View, Image } from 'react-native';
import { List, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import ISO3166_1 from '@/models/tmdb/ISO3166-1';
import { MovieBuy, MovieWatchProvidersResult } from '@/models/tmdb/movie/movieWatchProviders';
import { useGetMovieWatchProvidersQuery } from '@/redux/api/tmdb/movieApi';
import useAuth from '@/hooks/useAuth';
import imageUrl from '@/utils/imageUrl';
import Spinner from '../Spinner';

type WatchProvidersProps = {
	movieId: number | string | undefined;
};

type WatchProviderItemsProps = {
	provider: MovieBuy;
};

type WatchProviderListProps = {
	providers: MovieWatchProvidersResult | null;
	isLoading: boolean;
};

const WatchProviderItems: React.FC<WatchProviderItemsProps> = ({
	provider,
}: WatchProviderItemsProps) => {
	return (
		<View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
			<Image
				key={provider.provider_id}
				style={{ width: 40, height: 40, borderRadius: 4 }}
				source={{
					uri: imageUrl(provider.logo_path),
				}}
			/>
		</View>
	);
};

const WatchProviderList: React.FC<WatchProviderListProps> = ({
	providers,
	isLoading,
}: WatchProviderListProps) => {
	const theme = useTheme();
	const isStreaming = useMemo(() => !!providers?.flatrate, [providers?.flatrate]);

	const handleStreamingClick = () => {
		if (!providers?.link) return;

		Linking.openURL(providers?.link);
	};

	const [expanded, setExpanded] = useState(true);

	useEffect(() => {
		setExpanded(!isStreaming);
	}, [isStreaming]);

	if (isLoading) {
		return (
			<View style={{ padding: 4 }}>
				<Spinner />
			</View>
		);
	}

	if (!providers && !isLoading) return null;

	return (
		<View style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			{isStreaming ? (
				<View style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<Text variant="labelLarge">Stream</Text>
					<TouchableRipple style={{ borderRadius: 4 }} onPress={handleStreamingClick}>
						<View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
							{providers?.flatrate?.map((provider) => <WatchProviderItems provider={provider} />)}
						</View>
					</TouchableRipple>
				</View>
			) : (
				<View style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<Text variant="labelLarge">Stream</Text>
					<Text variant="labelSmall">Not available</Text>
				</View>
			)}
			<List.Accordion
				titleStyle={{ fontSize: 14, includeFontPadding: false }}
				style={{ backgroundColor: theme.colors.inverseOnSurface, borderRadius: 4, padding: 1 }}
				onPress={() => setExpanded(!expanded)}
				title="Additional Watch Options"
				expanded={expanded}
			>
				<List.Section>
					{providers?.rent && (
						<List.Item
							onPress={handleStreamingClick}
							title={
								<View style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
									<Text variant="labelLarge">Rent</Text>
									<View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
										{providers.rent?.map((provider) => <WatchProviderItems provider={provider} />)}
									</View>
								</View>
							}
						/>
					)}
					{providers?.buy && (
						<List.Item
							onPress={handleStreamingClick}
							title={
								<View style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
									<Text variant="labelLarge">Buy</Text>
									<View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
										{providers.buy?.map((provider) => <WatchProviderItems provider={provider} />)}
									</View>
								</View>
							}
						/>
					)}
				</List.Section>
			</List.Accordion>
		</View>
	);
};

const WatchProviders: React.FC<WatchProvidersProps> = ({ movieId }: WatchProvidersProps) => {
	const { tmrevUser } = useAuth({});

	const { data: watchProviderData, isLoading } = useGetMovieWatchProvidersQuery({
		movie_id: Number(movieId),
	});

	const watchProvider = useMemo(() => {
		const defaultISO = tmrevUser?.countryCode || ISO3166_1.UNITED_STATES;

		if (!watchProviderData || !Object.keys(watchProviderData.results).length) return null;

		const providers: MovieWatchProvidersResult = JSON.parse(
			JSON.stringify(watchProviderData.results[defaultISO])
		);

		if (providers) {
			providers.flatrate = providers.flatrate?.sort(
				(a, b) => a.display_priority - b.display_priority
			);
			providers.buy = providers.buy?.sort((a, b) => a.display_priority - b.display_priority);
			providers.rent = providers.rent?.sort((a, b) => a.display_priority - b.display_priority);
		}

		return providers;
	}, [watchProviderData, tmrevUser]);

	return (
		<Surface
			style={{
				display: 'flex',
				flexDirection: 'column',
				borderRadius: 4,
				padding: 8,
				gap: 8,
			}}
		>
			{!isLoading && !watchProvider && (
				<View>
					<Text variant="labelLarge">No Watch Providers Available</Text>
				</View>
			)}
			<WatchProviderList isLoading={isLoading} providers={watchProvider} />
			<View>
				<Text variant="labelSmall">Data sourced from JustWatch</Text>
			</View>
		</Surface>
	);
};

export default WatchProviders;
