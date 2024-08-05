import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { List, useTheme, Icon } from 'react-native-paper';
import { FromLocation } from '@/models';
import { actorInsightsRoute, profileInsightGenreRoute } from '@/constants/routes';

const ListItems = [
	{
		title: 'Genres',
		description:
			'Discover your favorite genres, least favorites, and genre-based category rankings.',
		icon: 'tag-faces',
		enabled: true,
		route: (from: FromLocation, profileId: string) => profileInsightGenreRoute(from, profileId),
	},
	{
		title: 'Actors',
		description: 'Discover your most reviewed actors.',
		icon: 'account-group',
		enabled: true,
		route: (from: FromLocation, profileId: string) => actorInsightsRoute(from, profileId),
	},
];

type InsightsNavigationSearchParams = {
	from: FromLocation;
	profileId: string;
};

const InsightsNavigation = () => {
	const theme = useTheme();
	const router = useRouter();

	const { from, profileId } = useLocalSearchParams<InsightsNavigationSearchParams>();

	return (
		<>
			<Stack.Screen options={{ title: 'Insights', headerRight: () => null }} />
			<View>
				<List.Section style={{ backgroundColor: theme.colors.background, marginTop: 0 }}>
					{ListItems.map((item) => (
						<List.Item
							onPress={() => router.navigate(item.route(from!, profileId!))}
							disabled={!item.enabled}
							key={item.title}
							title={item.title}
							description={item.description}
							left={(props) => <List.Icon {...props} icon={item.icon} />}
							right={() => (
								<View
									style={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										gap: 4,
									}}
								>
									<Icon source="chevron-right" color="gray" size={24} />
								</View>
							)}
						/>
					))}
				</List.Section>
			</View>
		</>
	);
};

export default InsightsNavigation;
