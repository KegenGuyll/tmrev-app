import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image, RefreshControl, TouchableHighlight, View } from 'react-native';
import { Text } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import { useState } from 'react';
import { FromLocation } from '@/models';
import imageUrl from '@/utils/imageUrl';
import { personDetailsRoute } from '@/constants/routes';
import { useInsightControllerGetActorInsights } from '@/api/tmrev-api-v2';

type InsightsActorSearchParams = {
	from: FromLocation;
	profileId: string;
};

const ActorInsights = () => {
	const { from, profileId } = useLocalSearchParams<InsightsActorSearchParams>();
	const [refreshing, setRefreshing] = useState(false);

	const { data, isLoading, refetch } = useInsightControllerGetActorInsights(profileId!, {
		query: {
			enabled: !!profileId,
		},
	});

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	};

	if (isLoading) {
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);
	}

	if (!data) {
		return (
			<View>
				<Text>No data</Text>
			</View>
		);
	}

	return (
		<>
			<Stack.Screen options={{ title: 'Actor Insights', headerRight: () => null }} />
			<View>
				<FlatGrid
					ListHeaderComponent={
						<Text style={{ marginBottom: 12, marginHorizontal: 12 }} variant="headlineMedium">
							Most Reviewed Actors
						</Text>
					}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					spacing={16}
					data={data}
					renderItem={({ item }) => (
						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								alignContent: 'center',
								alignItems: 'center',
							}}
						>
							<TouchableHighlight
								onPress={() => router.navigate(personDetailsRoute(from!, String(item.id)))}
							>
								<Image
									style={{ borderRadius: 100 }}
									source={{ uri: imageUrl(item.details.profile_path) }}
									width={128}
									height={128}
								/>
							</TouchableHighlight>
							<Text variant="labelLarge">{item.name}</Text>
							<Text variant="labelSmall">{item.count} Movies</Text>
						</View>
					)}
				/>
			</View>
		</>
	);
};

export default ActorInsights;
