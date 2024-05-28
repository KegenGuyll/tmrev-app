import { Stack, useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useState } from 'react';
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

	const handleDataRefresh = async () => {
		setRefreshing(true);
		await refetchInsights().unwrap();
		setRefreshing(false);
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Genre Insights' }} />
			<ScrollView
				contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
				refreshControl={
					<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={handleDataRefresh} />
				}
			>
				{insightData && insightData.data.mostReviewedRankedGenres.length && (
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
