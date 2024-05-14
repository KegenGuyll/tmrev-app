/* eslint-disable react/no-unstable-nested-components */
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Icon, List, useTheme, Text } from 'react-native-paper';
import { FromLocation } from '@/models';
import { allReviewsRoute, watchedMoviesRoute } from '@/constants/routes';

type ProfileNavigationProps = {
	profileId: string;
	from: FromLocation;
	listCount: number;
	reviewCount: number;
	watchedCount: number;
};

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
	profileId,
	from,
	listCount,
	reviewCount,
	watchedCount,
}: ProfileNavigationProps) => {
	const router = useRouter();
	const theme = useTheme();

	return (
		<List.Section style={{ backgroundColor: theme.colors.backdrop, marginTop: 0 }}>
			<List.Item
				style={{
					borderBottomColor: theme.colors.background,
					borderBottomWidth: 1,
				}}
				onPress={() => router.push(allReviewsRoute(from, profileId))}
				title="Reviews"
				left={(props) => <List.Icon {...props} icon="message-draw" />}
				right={() => (
					<View
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							gap: 4,
						}}
					>
						<Text theme={{ colors: { onSurface: 'gray' } }} variant="labelLarge">
							{reviewCount}
						</Text>
						<Icon source="chevron-right" color="gray" size={24} />
					</View>
				)}
			/>
			<List.Item
				style={{ borderBottomColor: theme.colors.background, borderBottomWidth: 1 }}
				title="Created Lists"
				left={(props) => <List.Icon {...props} icon="format-list-numbered" />}
				right={() => (
					<View
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							gap: 4,
						}}
					>
						<Text theme={{ colors: { onSurface: 'gray' } }} variant="labelLarge">
							{listCount}
						</Text>
						<Icon source="chevron-right" color="gray" size={24} />
					</View>
				)}
			/>
			<List.Item
				onPress={() => router.push(watchedMoviesRoute(from, profileId))}
				style={{ borderBottomColor: theme.colors.background, borderBottomWidth: 1 }}
				title="Movies Seen"
				left={(props) => <List.Icon {...props} icon="movie-play" />}
				right={() => (
					<View
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							gap: 4,
						}}
					>
						<Text theme={{ colors: { onSurface: 'gray' } }} variant="labelLarge">
							{watchedCount}
						</Text>
						<Icon source="chevron-right" color="gray" size={24} />
					</View>
				)}
			/>
		</List.Section>
	);
};

export default ProfileNavigation;
