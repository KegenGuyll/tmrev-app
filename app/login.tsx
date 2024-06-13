import { Platform, View } from 'react-native';
import { Text, Button, TextInput, Divider, Snackbar } from 'react-native-paper';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { loggedInProfileRoute } from '@/constants/routes';

const Login: React.FC = () => {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>('');

	const { onGoogleSignInButtonPress, emailSignIn, onAppleSignInButtonPress } = useAuth({
		onSuccessfulSignIn: () => {
			router.replace(loggedInProfileRoute('profile'));
		},
		onError: setErrorMessage,
	});

	const onEmailSignIn = async () => {
		if (!email || !password) {
			setErrorMessage('Please enter your email and password');
			return;
		}

		await emailSignIn(email, password);
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Login' }} />
			<View style={{ gap: 16, padding: 16 }}>
				<View>
					<Text variant="headlineLarge">Log In</Text>
					<Text variant="titleSmall">Welcome back! Please enter your details.</Text>
				</View>

				<View style={{ gap: 16 }}>
					<TextInput
						spellCheck={false}
						inputMode="email"
						value={email}
						onChangeText={(t) => setEmail(t)}
						mode="outlined"
						label="Email"
					/>
					<TextInput
						secureTextEntry={!showPassword}
						value={password}
						onChangeText={(t) => setPassword(t)}
						mode="outlined"
						label="Password"
						right={
							<TextInput.Icon
								onPress={() => setShowPassword(!showPassword)}
								icon={!showPassword ? 'eye' : 'eye-off'}
							/>
						}
					/>
					<Text style={{ textAlign: 'right' }}>Forgot Password?</Text>
					<Button mode="contained" onPress={onEmailSignIn}>
						Login
					</Button>
				</View>
				<Divider />
				<Link href="/signup">
					<Text style={{ textAlign: 'center', padding: 16 }}>
						Don&apos;t have an account? Sign up
					</Text>
				</Link>

				<View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
					<GoogleSigninButton
						style={{ width: '100%', height: 45 }}
						size={GoogleSigninButton.Size.Wide}
						color={GoogleSigninButton.Color.Light}
						onPress={onGoogleSignInButtonPress}
					/>
					{Platform.OS === 'ios' && (
						<AppleButton
							buttonStyle={AppleButton.Style.WHITE}
							buttonType={AppleButton.Type.SIGN_IN}
							style={{
								width: '100%',
								height: 45,
							}}
							onPress={onAppleSignInButtonPress}
						/>
					)}
				</View>
			</View>
			<Snackbar visible={!!errorMessage} onDismiss={() => setErrorMessage(null)}>
				{errorMessage}
			</Snackbar>
		</>
	);
};

export default Login;
