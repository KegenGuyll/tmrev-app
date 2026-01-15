import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

import { MD3DarkTheme, PaperProvider, Snackbar } from 'react-native-paper';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, View } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import { store } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { hideSnackbar } from '@/redux/slice/globalSnackbar';
import QueryClientProvider from '@/providers/QueryClient';

Sentry.init({
	dsn: 'https://9c8c84585fb730b65ab416d6f989e981@o4508169060745216.ingest.us.sentry.io/4508169062055936',

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// enableSpotlight: __DEV__,
});

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

export const unstableSettings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: '(tabs)/home',
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

	const { visible, message } = useAppSelector((state) => state.globalSnackbar);
	const dispatch = useAppDispatch();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<StatusBar barStyle="light-content" />
			<PaperProvider theme={MD3DarkTheme}>
				<QueryClientProvider>
					<BottomSheetModalProvider>
						<ThemeProvider value={DarkTheme}>
							<View style={{ height: '100%', width: '100%' }}>
								<Stack
									screenOptions={{
										headerTintColor: 'white',
									}}
								>
									<Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
									<Stack.Screen name="login" />
									<Stack.Screen name="signup" />
									<Stack.Screen name="forgotPassword" />
								</Stack>
								<Snackbar
									action={{
										label: 'Dismiss',
										onPress: () => dispatch(hideSnackbar()),
									}}
									onDismiss={() => dispatch(hideSnackbar())}
									visible={visible}
								>
									{message}
								</Snackbar>
							</View>
						</ThemeProvider>
					</BottomSheetModalProvider>
				</QueryClientProvider>
			</PaperProvider>
		</GestureHandlerRootView>
	);
};
