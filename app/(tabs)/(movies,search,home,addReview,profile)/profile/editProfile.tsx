import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { Button, Divider, TextInput } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useGetUserQuery, useUpdateUserMutation } from '@/redux/api/tmrev';

const EditProfile = () => {
	const { currentUser } = auth();
	const { data } = useGetUserQuery(
		{ uid: currentUser?.uid as string },
		{ skip: !currentUser || !currentUser.uid }
	);
	const router = useRouter();
	const [updateUser] = useUpdateUserMutation();

	const [form, setForm] = useState({
		firstName: data?.firstName,
		lastName: data?.lastName,
		location: data?.location,
		bio: data?.bio,
	});

	useEffect(() => {
		setForm({
			firstName: data?.firstName,
			lastName: data?.lastName,
			location: data?.location,
			bio: data?.bio,
		});
	}, []);

	const handleFormChange = (key: string, value: string) => {
		setForm({ ...form, [key]: value });
	};

	const handleUpdateUser = async () => {
		if (!currentUser || !form.firstName || !form.lastName) return;

		try {
			const token = await currentUser.getIdToken();

			await updateUser({
				authToken: token,
				firstName: form.firstName,
				lastName: form.lastName,
				location: form.location,
				bio: form.bio,
			});

			router.dismiss(2);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<Stack.Screen
				options={{ headerShown: true, title: `Edit Profile`, headerRight: () => null }}
			/>
			<View style={styles.container}>
				<TextInput
					mode="outlined"
					label="First Name"
					onChange={(e) => handleFormChange('firstName', e.nativeEvent.text)}
					value={form.firstName}
					error={form.firstName === ''}
				/>
				<TextInput
					mode="outlined"
					label="Last Name"
					onChange={(e) => handleFormChange('lastName', e.nativeEvent.text)}
					value={form.lastName}
					error={form.lastName === ''}
				/>
				<TextInput
					mode="outlined"
					label="Location"
					onChange={(e) => handleFormChange('location', e.nativeEvent.text)}
					value={form.location}
				/>
				<TextInput
					mode="outlined"
					label="Bio"
					multiline
					numberOfLines={4}
					onChange={(e) => handleFormChange('bio', e.nativeEvent.text)}
					value={form.bio}
				/>
				<Divider />
				<View style={{ gap: 8 }}>
					<Button
						disabled={!form.firstName || !form.lastName}
						onPress={handleUpdateUser}
						mode="contained"
					>
						Save
					</Button>
					<Button onPress={() => router.back()} mode="outlined">
						Cancel
					</Button>
				</View>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		marginTop: 16,
	},
});

export default EditProfile;
