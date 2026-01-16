import { RefreshControl, View, SafeAreaView, ScrollView } from 'react-native';
import { Button, Divider, IconButton, Snackbar, Text, useTheme } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import useAuth from '@/hooks/useAuth';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileNavigation from '@/components/Profile/ProfileListNavigationt';
import ProfilePinnedMovies from '@/components/Profile/ProfilePinnedMovies';
import { loginRoute, profileSettingsRoute, signupRoute } from '@/constants/routes';
import BarChart from '@/components/CustomCharts/BarChart';
import Heatmap from '@/components/CustomCharts/Heatmap';
import {
	useInsightControllerGetGenreInsights,
	useInsightControllerGetHeatmapInsights,
	useUserControllerFindOne,
} from '@/api/tmrev-api-v2';

const days = 60;

const Profile = () => {
	const { currentUser, initializing } = useAuth({});
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');

	const theme = useTheme();

	const {
		data,
		isLoading,
		refetch,
		error: userError,
	} = useUserControllerFindOne(currentUser?.uid as string, {
		query: { enabled: !!currentUser?.uid },
	});

	const { data: insightData, refetch: refetchInsights } = useInsightControllerGetGenreInsights(
		currentUser?.uid as string,
		{
			query: { enabled: !!currentUser?.uid },
		}
	);

	const { data: heatmapData, refetch: refetchHeatMap } = useInsightControllerGetHeatmapInsights(
		currentUser?.uid as string,
		{ days },
		{
			query: { enabled: !!currentUser?.uid },
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
		await refetchInsights();
		await refetchHeatMap();
		await refetch();
		setRefreshing(false);
	};

	if (initializing || isLoading || (!data && currentUser)) {
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
					title: data.username,
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
								favoriteGenres={insightData?.mostReviewedGenres || []}
								from="profile"
								user={data}
							/>
							<ProfileNavigation
								from="profile"
								profileId={currentUser.uid}
								listCount={data.watchListCount}
								reviewCount={data.reviewCount}
								watchedCount={data.watchedCount}
							/>
						</View>
						<View
							style={{ paddingHorizontal: 8, display: 'flex', flexDirection: 'column', gap: 16 }}
						>
							{insightData && !!insightData.mostReviewedGenres.length && (
								<BarChart
									chartTitle="Most Reviewed Genres"
									barLabelColor="black"
									barColor={theme.colors.primary}
									data={insightData?.mostReviewedGenres}
									canvasHeight={insightData.mostReviewedGenres.length * 38}
								/>
							)}
							<View style={{ height: 150, width: '100%', paddingTop: 16, paddingBottom: 8 }}>
								<Heatmap
									chartTitle={`Movie Reviews (${days} days)`}
									customColor={theme.colors.inversePrimary}
									noValueColor={theme.colors.background}
									heatmapData={heatmapData || []}
								/>
							</View>
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
