import { Button, Divider, Snackbar, Text, TextInput } from 'react-native-paper';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { Link, Stack, useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { useState } from 'react';
import { loggedInProfileRoute } from '@/constants/routes';
import useAuth from '@/hooks/useAuth';
import useDebounce from '@/hooks/useDebounce';
import { useUserControllerIsUsernameAvailable } from '@/api/tmrev-api-v2';

const Signup: React.FC = () => {
	const router = useRouter();

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const debouncedUsername = useDebounce(username, 200);

	const { data: isUsernameAvailable } = useUserControllerIsUsernameAvailable(debouncedUsername, {
		query: {
			enabled: !!debouncedUsername,
		},
	});

	const doesUsernameMeetRequirements = username.length >= 5 && username.length <= 15;

	const { emailSignUp, onGoogleSignInButtonPress, onAppleSignInButtonPress } = useAuth({
		onSuccessfulSignIn: () => {
			router.replace(loggedInProfileRoute('profile'));
		},
		onError: setErrorMessage,
	});

	const onEmailSignUp = async () => {
		if (!email || !password || !username) {
			setErrorMessage('Please enter your email, password, and username');
			return;
		}

		await emailSignUp(username, email, password);
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Sign Up' }} />
			<View style={{ gap: 16, padding: 16 }}>
				<View>
					<Text variant="headlineLarge">Create an Account</Text>
					<Text variant="titleSmall">Create an account to get started.</Text>
				</View>
				<View style={{ gap: 8 }}>
					<View>
						<TextInput
							error={!isUsernameAvailable?.available || !doesUsernameMeetRequirements}
							value={username}
							onChangeText={setUsername}
							label="Username"
							mode="outlined"
						/>
						{!isUsernameAvailable?.available && (
							<Text variant="labelMedium">Username is already taken</Text>
						)}
						{!doesUsernameMeetRequirements && (
							<Text variant="labelMedium">Username must be between 5 and 15 characters</Text>
						)}
					</View>

					<TextInput
						value={email}
						onChangeText={setEmail}
						label="Email"
						inputMode="email"
						mode="outlined"
					/>
					<TextInput
						value={password}
						onChangeText={setPassword}
						secureTextEntry={!showPassword}
						label="Password"
						mode="outlined"
						right={
							<TextInput.Icon
								onPress={() => setShowPassword(!showPassword)}
								icon={!showPassword ? 'eye' : 'eye-off'}
							/>
						}
					/>
					<Link href="/login">
						<Text variant="labelMedium" style={{ textAlign: 'right' }}>
							Already have an account? Log in
						</Text>
					</Link>
				</View>
				<Button onPress={onEmailSignUp} mode="contained">
					Sign Up
				</Button>
				<Divider />
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
							buttonType={AppleButton.Type.SIGN_UP}
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

export default Signup;
