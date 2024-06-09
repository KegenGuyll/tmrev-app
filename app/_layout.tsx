import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, View } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { store } from '@/redux/store';

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

export const unstableSettings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: '(tabs)/(home)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
	const [loaded, error] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<Provider store={store}>
			<RootLayoutNav />
		</Provider>
	);
};

export default RootLayout;

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	console.log('Message handled in the background!', remoteMessage);
});

function useNotificationObserver() {
	useEffect(() => {
		let isMounted = true;

		function redirect(notification: Notifications.Notification) {
			const { url } = (notification.request.trigger as any).payload;
			if (url) {
				router.push(url);
			}
		}

		Notifications.getLastNotificationResponseAsync().then((response) => {
			if (!isMounted || !response?.notification) {
				return;
			}
			redirect(response?.notification);
		});

		const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
			redirect(response.notification);
		});

		return () => {
			isMounted = false;
			subscription.remove();
		};
	}, []);
}

const RootLayoutNav = () => {
	useNotificationObserver();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<StatusBar barStyle="light-content" />
			<PaperProvider theme={MD3DarkTheme}>
				<BottomSheetModalProvider>
					<ThemeProvider value={DarkTheme}>
						<View style={{ height: '100%', width: '100%' }}>
							<Stack
								screenOptions={{
									headerTintColor: 'white',
								}}
							>
								<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
								<Stack.Screen name="login" />
							</Stack>
						</View>
					</ThemeProvider>
				</BottomSheetModalProvider>
			</PaperProvider>
		</GestureHandlerRootView>
	);
};
