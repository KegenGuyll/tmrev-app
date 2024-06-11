import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GOOGLE_WEB_CLIENT_ID, TMREV_API_URL } from '@env';

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

const findUserByUid = async (uid?: string) => {
	try {
		if (!uid) {
			return undefined;
		}
		const res = await fetch(`${TMREV_API_URL}/user/isUser/${uid}`);
		const data = await res.json();

		return data;
	} catch (error) {
		console.error(error);
		return undefined;
	}
};

type UseGoogleAuthInitialValues = {
	onSuccessfulSignIn: () => void;
	onError: (error: string) => void;
};

const useAuth = ({ onSuccessfulSignIn, onError }: UseGoogleAuthInitialValues) => {
	const checkIfUserExists = async (uid: string) => {
		const result = await findUserByUid(uid);

		if (!result) {
			return false;
		}

		return true;
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
				firstName: auth().currentUser?.displayName?.split(' ')[0] || 'First Name',
				lastName: auth().currentUser?.displayName?.split(' ')[1] || 'Last Name',
				photoUrl:
					currentUser.photoURL || `https://api.dicebear.com/8.x/thumbs/png?seed=${currentUser.uid}`,
				bio: '',
				location: '',
				link: null,
				public: true,
			} as CreateTMREVUser),
		});
	};

	const onGoogleSignInButtonPress = async () => {
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

			if (!currentUser) {
				return;
			}

			const doesUserExist = await checkIfUserExists(currentUser?.uid);

			if (!doesUserExist) {
				await createTMREVUser(currentUser);
			}

			onSuccessfulSignIn();
		} catch (error: any) {
			if (error.message && typeof error.message === 'string') {
				const message = error.message.split(']')[1];

				onError(message);
			}
			console.error(error.message);
		}
	};

	const onAppleSignInButtonPress = async () => {
		try {
			// Start the sign-in request
			const appleAuthRequestResponse = await appleAuth.performRequest({
				requestedOperation: appleAuth.Operation.LOGIN,
				// As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
				// See: https://github.com/invertase/react-native-apple-authentication#faqs
				requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
			});

			// Ensure Apple returned a user identityToken
			if (!appleAuthRequestResponse.identityToken) {
				onError('Apple Sign-In failed - no identify token returned');
				return;
			}

			// Create a Firebase credential from the response
			const { identityToken, nonce } = appleAuthRequestResponse;
			const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

			// Sign the user in with the credential
			await auth().signInWithCredential(appleCredential);

			const { currentUser } = auth();

			if (!currentUser) {
				return;
			}

			const doesUserExist = await checkIfUserExists(currentUser?.uid);

			if (!doesUserExist) {
				await createTMREVUser(currentUser);
			}

			onSuccessfulSignIn();
		} catch (error: any) {
			if (error.message && typeof error.message === 'string') {
				onError(error.message);
			}
		}
	};

	const emailSignIn = async (email: string, password: string) => {
		try {
			await auth().signInWithEmailAndPassword(email, password);

			onSuccessfulSignIn();
		} catch (error: any) {
			if (error.message && typeof error.message === 'string') {
				const message = error.message.split(']')[1];

				onError(message);
			}
			console.error(error);
		}
	};

	return {
		onGoogleSignInButtonPress,
		onAppleSignInButtonPress,
		emailSignIn,
	};
};

export default useAuth;
