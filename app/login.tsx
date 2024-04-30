import { View } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID, TMREV_API_URL } from '@env';
import { useRouter } from 'expo-router';

type CreateTMREVUser = {
	bio: string;
	email: string;
	firstName: string;
	lastName: string;
	link: string | null;
	location: string;
	photoUrl: string | null;
	public: boolean;
	uuid: string;
};

const Login: React.FC = () => {
	const router = useRouter();

	const findUserByUid = async (uid: string) => {
		const res = await fetch(`${TMREV_API_URL}/user/isUser/${uid}`);
		const data = await res.json();

		return data;
	};

	const createTMREVUser = async (currentUser: FirebaseAuthTypes.User) => {
		const token = await currentUser.getIdToken();
		await fetch(`${TMREV_API_URL}/user`, {
			method: 'POST',
			headers: {
				authorization: token,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				uuid: currentUser.uid,
				email: currentUser.email,
				firstName: auth().currentUser?.displayName?.split(' ')[0],
				lastName: auth().currentUser?.displayName?.split(' ')[1],
				photoUrl: currentUser.photoURL,
				bio: '',
				location: '',
				link: null,
				public: true,
			} as CreateTMREVUser),
		});
	};

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
			const { currentUser } = auth();

			if (currentUser) {
				const dbUser = await findUserByUid(currentUser?.uid);

				if (!dbUser) {
					await createTMREVUser(currentUser);
				}
			}

			router.replace('/(tabs)/(profile)/profile');
		} catch (error) {
			console.error(error, 'error');
		}
	};

	return (
		<View style={{ gap: 16, padding: 16 }}>
			<View style={{ gap: 8 }}>
				<TextInput mode="outlined" label="Email" />
				<TextInput mode="outlined" label="Password" />
				<Text style={{ textAlign: 'right' }}>Forgot Password?</Text>
				<Button mode="contained" onPress={onGoogleButtonPress}>
					Login
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
