import { RefreshControl, View, SafeAreaView, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import { Button, Divider, IconButton, Snackbar, Text, useTheme } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import { useGetGenreInsightsQuery, useGetV2UserQuery } from '@/redux/api/tmrev';
import ProfileNavigation from '@/components/Profile/ProfileListNavigationt';
import ProfilePinnedMovies from '@/components/Profile/ProfilePinnedMovies';
import { loginRoute, profileSettingsRoute, signupRoute } from '@/constants/routes';
import BarChart from '@/components/CustomCharts/BarChart';

const Profile = () => {
	const { currentUser } = auth();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');

	const theme = useTheme();

	const {
		data,
		isLoading,
		refetch,
		error: userError,
	} = useGetV2UserQuery(
		{ uid: currentUser?.uid as string },
		{ skip: !currentUser || !currentUser.uid }
	);
	const { data: insightData, refetch: refetchInsights } = useGetGenreInsightsQuery(
		currentUser?.uid as string,
		{
			skip: !currentUser || !currentUser.uid,
		}
	);

	useEffect(() => {
		if (!userError || !currentUser) return;

		if (userError && (userError as any).data && (userError as any).data === 'unable to find user') {
			auth().signOut();
		}
	}, [userError]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetchInsights().unwrap();
		await refetch().unwrap();
		setRefreshing(false);
	};

	if (isLoading || (!data && currentUser)) {
		return <Text>Loading...</Text>;
	}

	if (!currentUser || !data) {
		return (
			<>
				<Stack.Screen options={{ title: 'Profile', headerRight: () => null }} />
				<SafeAreaView style={{ gap: 8 }}>
					<Text variant="headlineMedium">You&apos;re not currently logged in.</Text>
					<View style={{ gap: 8 }}>
						<Button onPress={() => router.navigate(loginRoute())} mode="contained">
							Login
						</Button>
						<Divider />
						<Button onPress={() => router.navigate(signupRoute())} mode="outlined">
							Sign Up
						</Button>
					</View>
				</SafeAreaView>
			</>
		);
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: data.body.username,
					headerRight: () => (
						<IconButton
							onPress={() => router.navigate(profileSettingsRoute('profile', currentUser.uid))}
							icon="menu"
						/>
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
							<ProfileHeader
								favoriteGenres={insightData?.data.favoriteGenres}
								from="profile"
								user={data.body}
							/>
							<ProfileNavigation
								from="profile"
								profileId={currentUser.uid}
								listCount={data.body.listCount}
								reviewCount={data.body.reviewCount}
								watchedCount={data.body.watchedCount}
							/>
						</View>
						<View
							style={{ paddingHorizontal: 8, display: 'flex', flexDirection: 'column', gap: 16 }}
						>
							{insightData && !!insightData.data.mostReviewedGenres.length && (
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
								profileId={currentUser.uid}
								from="profile"
							/>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
			<Snackbar visible={!!snackbarMessage} onDismiss={() => setSnackbarMessage('')}>
				{snackbarMessage}
			</Snackbar>
		</>
	);
};

export default Profile;
