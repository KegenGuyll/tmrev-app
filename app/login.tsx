import { View } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
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
			router.replace('/(tabs)/(home)/home');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<View style={{ gap: 16, padding: 16 }}>
			<View style={{ gap: 8 }}>
				<TextInput mode="outlined" label="Email" />
				<TextInput mode="outlined" label="Password" />
				<Text style={{ textAlign: 'right' }}>Forgot Password?</Text>
				<Button mode="contained" onPress={onGoogleButtonPress}>
					<Text>Login</Text>
				</Button>
			</View>
			<Divider />
			<View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<GoogleSigninButton
					size={GoogleSigninButton.Size.Wide}
					color={GoogleSigninButton.Color.Light}
					onPress={onGoogleButtonPress}
				/>
			</View>
		</View>
	);
};

export default Login;
