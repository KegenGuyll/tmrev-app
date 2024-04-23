import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { useRouter } from 'expo-router';

const Login: React.FC = () => {
	const router = useRouter();

	const onGoogleButtonPress = async () => {
		try {
			GoogleSignin.configure({
				webClientId: GOOGLE_WEB_CLIENT_ID,
			});
			// Check if your device supports Google Play
			await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
			// Get the users ID token
			const { idToken } = await GoogleSignin.signIn();

			// Create a Google credential with the token
			const googleCredential = auth.GoogleAuthProvider.credential(idToken);

			// Sign-in the user with the credential
			await auth().signInWithCredential(googleCredential);
			router.replace('/(tabs)/');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<View>
			<Text>Login</Text>
			<Button onPress={onGoogleButtonPress}>
				<Text>Google Login</Text>
			</Button>
		</View>
	);
};

export default Login;
