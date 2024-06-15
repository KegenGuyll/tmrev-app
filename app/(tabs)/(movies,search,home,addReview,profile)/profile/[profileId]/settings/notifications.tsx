import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Platform, View } from 'react-native';
import { Snackbar, Switch, Text } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {
	useDeleteDeviceTokenMutation,
	useIsDeviceTokenSavedQuery,
	useSaveUserDeviceTokenMutation,
} from '@/redux/api/tmrev';
import { errorPrompt } from '@/constants/messages';

const notifications = () => {
	const [deviceToken, setDeviceToken] = useState<string | null>(null);
	const [isEnabled, setIsEnabled] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [saveToken] = useSaveUserDeviceTokenMutation();
	const [deleteToken] = useDeleteDeviceTokenMutation();
	const { data, error, refetch } = useIsDeviceTokenSavedQuery(
		{ deviceToken: deviceToken || '' },
		{ skip: !deviceToken }
	);

	useEffect(() => {
		if (data) {
			setIsEnabled(data.saved);
		} else if (error) {
			setIsEnabled(false);
		}
	}, [data]);

	const fetchDeviceToken = async () => {
		const dt = await messaging().getToken();

		setDeviceToken(dt);
	};

	useEffect(() => {
		fetchDeviceToken();
	}, []);

	const onToggleSwitch = async (value: boolean) => {
		if (value) {
			await requestAccess();
			await refetch().unwrap();
		} else if (deviceToken) {
			await deleteToken({ deviceToken }).unwrap();
			await refetch().unwrap();
		} else {
			setSnackbarMessage(errorPrompt);
		}
	};

	const { currentUser } = auth();

	const requestAccess = async () => {
		try {
			if (!currentUser) return;
			if (Platform.OS === 'ios') {
				const authStatus = await messaging().requestPermission();

				const enabled =
					authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
					authStatus === messaging.AuthorizationStatus.PROVISIONAL;

				if (enabled) {
					const dt = await messaging().getToken();
					if (dt) {
						await saveToken(dt).unwrap();
					}
				}
			} else if (Platform.OS === 'android') {
				const authStatus = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
				);

				const enabled = authStatus === PermissionsAndroid.RESULTS.GRANTED;

				if (enabled) {
					const dt = await messaging().getToken();
					if (dt) {
						await saveToken(dt).unwrap();
					}
				}
			}
			setSnackbarMessage('Notifications enabled');
		} catch {
			setSnackbarMessage(errorPrompt);
		}
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Notifications', headerRight: () => null }} />
			<View style={{ padding: 16 }}>
				<View style={{ gap: 4 }}>
					<Text variant="labelMedium">Enable Push Notifications:</Text>
					<Switch value={isEnabled} onValueChange={onToggleSwitch} />
				</View>
			</View>
			<Snackbar visible={!!snackbarMessage} onDismiss={() => setSnackbarMessage('')}>
				{snackbarMessage}
			</Snackbar>
		</>
	);
};

export default notifications;
