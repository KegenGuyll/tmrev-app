import { Stack } from 'expo-router';
import auth from '@react-native-firebase/auth';
import { Alert, View } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { useState } from 'react';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');
	const [snackbarErrorMessage, setSnackbarErrorMessage] = useState<string | null>(null);

	const handleSendResetEmail = async () => {
		if (!email) {
			setSnackbarErrorMessage('Please enter your email.');
			return;
		}

		try {
			await auth().sendPasswordResetEmail(email);

			Alert.alert(
				'Password Reset Email Sent',
				'Please check your email for a password reset link.'
			);
		} catch (error: any) {
			if (error.message && typeof error.message === 'string') {
				const message = error.message.split(']')[1];

				setSnackbarErrorMessage(message);
			}
		}
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Forgot Password' }} />
			<View style={{ gap: 16, padding: 16 }}>
				<View>
					<Text variant="headlineLarge">Forgot Password</Text>
					<Text variant="titleSmall">Enter email to get a reset link.</Text>
				</View>
				<TextInput
					spellCheck={false}
					inputMode="email"
					value={email}
					onChangeText={setEmail}
					mode="outlined"
					label="Email"
				/>
				<Button mode="contained" onPress={handleSendResetEmail}>
					Send Reset Email
				</Button>
			</View>
			<Snackbar visible={!!snackbarErrorMessage} onDismiss={() => setSnackbarErrorMessage(null)}>
				{snackbarErrorMessage}
			</Snackbar>
		</>
	);
};

export default ForgotPassword;
