import {
	RefreshControl,
	View,
	SafeAreaView,
	ScrollView,
	Platform,
	// eslint-disable-next-line react-native/split-platform-components
	PermissionsAndroid,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { Button, Divider, IconButton, Menu, Snackbar, Text, useTheme } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import {
	useGetGenreInsightsQuery,
	useGetV2UserQuery,
	useSaveUserDeviceTokenMutation,
} from '@/redux/api/tmrev';
import ProfileNavigation from '@/components/Profile/ProfileListNavigationt';
import ProfilePinnedMovies from '@/components/Profile/ProfilePinnedMovies';
import { loginRoute, signupRoute } from '@/constants/routes';
import BarChart from '@/components/CustomCharts/BarChart';

const Profile = () => {
	const { currentUser } = auth();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');

	const [saveToken] = useSaveUserDeviceTokenMutation();

	const theme = useTheme();

	const { data, isLoading, refetch } = useGetV2UserQuery(
		{ uid: currentUser?.uid as string },
		{ skip: !currentUser || !currentUser.uid }
	);
	const { data: insightData, refetch: refetchInsights } = useGetGenreInsightsQuery(
		currentUser?.uid as string,
		{
			skip: !currentUser || !currentUser.uid,
		}
	);
	const [visible, setVisible] = useState(false);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetchInsights().unwrap();
		await refetch().unwrap();
		setRefreshing(false);
	};

	const openMenu = () => setVisible(true);
	const closeMenu = () => setVisible(false);

	const name = useMemo(() => `${data?.body.firstName} ${data?.body.lastName}`, [data]);

	const handleSignOut = async () => {
		try {
			closeMenu();
			await auth().signOut();
			router.replace('/(tabs)/(home)/home');
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeviceToken = async () => {
		try {
			if (!currentUser) return;

			if (Platform.OS === 'ios') {
				const authStatus = await messaging().requestPermission();

				const enabled =
					authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
					authStatus === messaging.AuthorizationStatus.PROVISIONAL;

				if (enabled) {
					const deviceToken = await messaging().getToken();
					if (deviceToken) {
						await saveToken(deviceToken).unwrap();
					}
				}
			} else if (Platform.OS === 'android') {
				const authStatus = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
				);

				const enabled = authStatus === PermissionsAndroid.RESULTS.GRANTED;

				if (enabled) {
					const deviceToken = await messaging().getToken();
					if (deviceToken) {
						await saveToken(deviceToken).unwrap();
					}
				}
			}
			setSnackbarMessage('Notifications enabled');
		} catch (error) {
			console.error(error);
		} finally {
			closeMenu();
		}
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
					title: name,
					headerRight: () => (
						<Menu
							visible={visible}
							onDismiss={closeMenu}
							anchor={<IconButton onPress={openMenu} icon="dots-vertical" />}
						>
							<Menu.Item onPress={handleDeviceToken} title="Enable Notifications" />
							<Menu.Item onPress={handleSignOut} title="Logout" />
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
