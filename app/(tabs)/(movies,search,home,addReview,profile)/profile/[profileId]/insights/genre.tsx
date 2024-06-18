import { Stack, useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useMemo, useState } from 'react';
import { FromLocation } from '@/models';
import { useGetGenreInsightsQuery } from '@/redux/api/tmrev';
import BarChart from '@/components/CustomCharts/BarChart';

type InsightsGenreSearchParams = {
	from: FromLocation;
	profileId: string;
};

const GenreInsights: React.FC = () => {
	const { profileId } = useLocalSearchParams<InsightsGenreSearchParams>();
	const [refreshing, setRefreshing] = useState(false);
	const theme = useTheme();

	const { data: insightData, refetch: refetchInsights } = useGetGenreInsightsQuery(profileId!, {
		skip: !profileId,
	});

	const hasInsightsToView = useMemo(
		() => insightData && !!insightData.data.mostReviewedRankedGenres.length,
		[insightData]
	);

	const handleDataRefresh = async () => {
		setRefreshing(true);
		await refetchInsights().unwrap();
		setRefreshing(false);
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Genre Insights', headerRight: () => null }} />
			<ScrollView
				contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
				refreshControl={
					<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={handleDataRefresh} />
				}
			>
				{!hasInsightsToView && (
					<View>
						<Text>
							Not enough data to generate insights. Try adding more reviews to get more insights.
							You need at least 4 reviews in a category to generate insights.
						</Text>
					</View>
				)}
				{insightData && hasInsightsToView && (
					<BarChart
						chartTitle="Highest Ranked Genres"
						barLabelColor="black"
						barColor={theme.colors.primary}
						data={insightData?.data.mostReviewedRankedGenres}
						canvasHeight={700}
						displayValue={false}
						barWidth={500}
					/>
				)}
			</ScrollView>
		</>
	);
};

export default GenreInsights;
