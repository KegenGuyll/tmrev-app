import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import { Button, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

const Profile = () => {
	const { currentUser } = auth();
	const router = useRouter();

	if (!currentUser) {
		return (
			<>
				<Stack.Screen options={{ headerShown: false }} />
				<SafeAreaView style={{ gap: 8 }}>
					<Text variant="headlineMedium">You&apos;re not currently logged in.</Text>
					<View style={{ gap: 8 }}>
						<Button onPress={() => router.push('/login')} mode="contained">
							<Text>Login</Text>
						</Button>
						<Divider />
						<Button onPress={() => router.push('/signup')} mode="outlined">
							<Text>Sign Up</Text>
						</Button>
					</View>
				</SafeAreaView>
			</>
		);
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<View>
				<Text>Profile</Text>
			</View>
		</>
	);
};

export default Profile;
