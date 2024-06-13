import { router as nonHookRouter, Stack, useRouter } from 'expo-router';
import { Alert, View } from 'react-native';
import { List, useTheme, Icon, Text } from 'react-native-paper';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import { homeRoute } from '@/constants/routes';

type SettingsListItem = {
	title: string;
	description: string;
	icon: string;
	enabled: boolean;
	action?: () => void;
	route?: string;
};

const SettingsListItems: SettingsListItem[] = [
	{
		title: 'Notifications',
		description: 'Manage your notifications',
		icon: 'bell',
		enabled: false,
		route: 'Notifications',
	},
	{
		title: 'Log Out',
		description: 'Log out of your account',
		icon: 'logout',
		enabled: true,
		action: async () => {
			await auth().signOut();

			nonHookRouter.dismissAll();

			await auth().onAuthStateChanged(() => {
				nonHookRouter.navigate(homeRoute('home'));
			});
		},
	},
	{
		title: 'Delete Account',
		description: 'Delete your account',
		icon: 'delete',
		enabled: true,
		action: () => {
			Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					style: 'destructive',
					text: 'Delete',
					onPress: async () => {
						const { currentUser } = auth();

						if (currentUser?.providerData[0].providerId === 'apple.com') {
							const { authorizationCode } = await appleAuth.performRequest({
								requestedOperation: appleAuth.Operation.REFRESH,
							});

							if (authorizationCode) {
								await auth().revokeToken(authorizationCode);
							}
						}

						// console.log(authorizationCode);

						// const user = auth().currentUser;
						// if (user) {
						// 	await user.delete();
						// }
					},
				},
			]);
		},
	},
];

const ProfileSettings = () => {
	const router = useRouter();
	const theme = useTheme();

	const handleOnPress = (item: SettingsListItem) => {
		if (item.action) {
			item.action();
		}

		if (item.route) {
			router.navigate(item.route);
		}
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Settings', headerRight: () => null }} />
			<View>
				<List.Section style={{ backgroundColor: theme.colors.background, marginTop: 0 }}>
					{SettingsListItems.map((item) => (
						<List.Item
							onPress={() => handleOnPress(item)}
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
									{item.route && <Icon source="chevron-right" color="gray" size={24} />}
								</View>
							)}
						/>
					))}
				</List.Section>
			</View>
		</>
	);
};

export default ProfileSettings;
