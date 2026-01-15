import { router as nonHookRouter, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, View } from 'react-native';
import { List, useTheme, Icon } from 'react-native-paper';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import React from 'react';
import useAuth from '@/hooks/useAuth';
import { homeRoute, profileSettingsNotificationsRoute } from '@/constants/routes';
import { useUserControllerRemove } from '@/api/tmrev-api-v2/endpoints';

type ProfileSettingsParams = {
	profileId: string;
};

const ProfileSettings = () => {
	const { profileId } = useLocalSearchParams<ProfileSettingsParams>();
	const router = useRouter();
	const theme = useTheme();
	const { mutateAsync: deleteUser } = useUserControllerRemove();

	const handleDeleteAlert = () => {
		Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				style: 'destructive',
				text: 'Delete',
				onPress: handleDeleteAccount,
			},
		]);
	};

	const handleLogout = async () => {
		await auth().signOut();

		router.dismissAll();

		await auth().onAuthStateChanged(() => {
			router.navigate(homeRoute('home'));
		});
	};

	const handleDeleteAccount = async () => {
		const { currentUser } = useAuth({});

		if (currentUser?.providerData[0].providerId === 'apple.com') {
			const { authorizationCode } = await appleAuth.performRequest({
				requestedOperation: appleAuth.Operation.REFRESH,
			});

			if (authorizationCode) {
				await auth().revokeToken(authorizationCode);
			}
		}

		if (currentUser?.uid) {
			await deleteUser({ id: currentUser.uid });
		}

		await auth().signOut();

		nonHookRouter.dismissAll();
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Settings', headerRight: () => null }} />
			<View>
				<List.Section style={{ backgroundColor: theme.colors.background, marginTop: 0 }}>
					<List.Item
						onPress={() => {
							router.navigate(profileSettingsNotificationsRoute('profile', profileId!));
						}}
						title="Notifications"
						description="Manage your notifications"
						left={(props) => <List.Icon {...props} icon="bell" />}
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
					<List.Item
						onPress={handleLogout}
						title="Log out"
						description="Log out of your account"
						left={(props) => <List.Icon {...props} icon="logout" />}
					/>
					<List.Item
						onPress={handleDeleteAlert}
						title="Delete Account"
						description="Delete your account"
						left={(props) => <List.Icon {...props} icon="delete" />}
					/>
				</List.Section>
			</View>
		</>
	);
};

export default ProfileSettings;
