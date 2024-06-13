import { Stack, useLocalSearchParams } from 'expo-router';
import { IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { View, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import { useGetGenreInsightsQuery, useGetV2UserQuery } from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import ProfileNavigation from '@/components/Profile/ProfileListNavigationt';
import ProfilePinnedMovies from '@/components/Profile/ProfilePinnedMovies';
import BarChart from '@/components/CustomCharts/BarChart';

export type ProfileSearchParams = {
	profileId: string;
	from?: FromLocation;
};

const Profile = () => {
	const { profileId, from } = useLocalSearchParams<ProfileSearchParams>();
	const [refreshing, setRefreshing] = useState(false);

	const theme = useTheme();

	if (!profileId) return null;

	const {
		data: profileData,
		isLoading: isProfileLoading,
		refetch,
	} = useGetV2UserQuery({ uid: profileId }, { skip: !profileId });

	const { data: insightData, refetch: refetchInsights } = useGetGenreInsightsQuery(profileId, {
		skip: !profileId,
	});

	const [visible, setVisible] = useState(false);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetchInsights().unwrap();
		await refetch().unwrap();
		setRefreshing(false);
	};

	const openMenu = () => setVisible(true);
	const closeMenu = () => setVisible(false);

	if (isProfileLoading || !profileData) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: profileData.body.username,
					headerRight: () => (
						<Menu
							visible={visible}
							onDismiss={closeMenu}
							anchor={<IconButton onPress={openMenu} icon="dots-vertical" />}
						>
							<Menu.Item onPress={closeMenu} title="Share Profile" />
						</Menu>
					),
				}}
			/>
			<SafeAreaView>
				<ScrollView
					refreshControl={
						<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={handleRefresh} />
					}
					contentContainerStyle={{ paddingBottom: 100 }}
				>
					<View style={{ gap: 16 }}>
						<View>
							<ProfileHeader user={profileData.body} from={from} />
							<ProfileNavigation
								from={from || 'home'}
								profileId={profileId}
								listCount={profileData.body.listCount}
								reviewCount={profileData.body.reviewCount}
								watchedCount={profileData.body.watchedCount}
							/>
						</View>
						<View
							style={{ paddingHorizontal: 8, display: 'flex', flexDirection: 'column', gap: 16 }}
						>
							{insightData && insightData.data.mostReviewedGenres.length && (
								<BarChart
									chartTitle="Most Reviewed Genres"
									barLabelColor="black"
									barColor={theme.colors.primary}
									data={insightData?.data.mostReviewedGenres}
									canvasHeight={insightData.data.mostReviewedGenres.length * 38}
								/>
							)}
							<ProfilePinnedMovies
								refreshing={refreshing}
								profileId={profileId}
								from={from || 'home'}
							/>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

export default Profile;
