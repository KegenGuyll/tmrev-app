import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Platform, View } from 'react-native';
import { Snackbar, Switch, Text } from 'react-native-paper';
import messaging from '@react-native-firebase/messaging';
import useAuth from '@/hooks/useAuth';
import {
	useDeleteDeviceTokenMutation,
	useIsDeviceTokenSavedQuery,
	useSaveUserDeviceTokenMutation,
} from '@/redux/api/tmrev';
import { errorPrompt } from '@/constants/messages';

const notifications = () => {
	const [deviceToken, setDeviceToken] = useState<string | null | undefined>(null);
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
		const dt = await requestAccess();

		setDeviceToken(dt);
	};

	useEffect(() => {
		fetchDeviceToken();
	}, []);

	const onToggleSwitch = async (value: boolean) => {
		if (value) {
			const token = await requestAccess();
			if (!token) return;
			await saveToken(token).unwrap();
			await refetch().unwrap();
			setSnackbarMessage('Notifications enabled');
		} else if (deviceToken) {
			await deleteToken({ deviceToken }).unwrap();
			await refetch().unwrap();
		} else {
			setSnackbarMessage(errorPrompt);
		}
	};

	const { currentUser } = useAuth({});

	const requestAccess = async (): Promise<string | undefined> => {
		try {
			if (!currentUser) return undefined;
			if (Platform.OS === 'ios') {
				const authStatus = await messaging().requestPermission();

				const enabled =
					authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
					authStatus === messaging.AuthorizationStatus.PROVISIONAL;

				if (!enabled) {
					setSnackbarMessage('Please enable notifications in your device settings');
				}

				if (enabled) {
					const dt = await messaging().getToken();

					if (dt) return dt;
				}
			} else if (Platform.OS === 'android') {
				const authStatus = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
				);

				const enabled = authStatus === PermissionsAndroid.RESULTS.GRANTED;

				if (enabled) {
					const dt = await messaging().getToken();
					if (dt) return dt;
				}
			}
			return undefined;
		} catch {
			return undefined;
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
