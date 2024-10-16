import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Button, Divider, TextInput, Text } from 'react-native-paper';
import React, { useEffect, useMemo, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import {
	useGetUserQuery,
	useIsUsernameAvailableQuery,
	useUpdateUserMutation,
} from '@/redux/api/tmrev';
import useDebounce from '@/hooks/useDebounce';

const EditProfile = () => {
	const { currentUser } = useAuth({});
	const { data } = useGetUserQuery(
		{ uid: currentUser?.uid as string },
		{ skip: !currentUser || !currentUser.uid }
	);

	const router = useRouter();
	const [updateUser] = useUpdateUserMutation();

	const [form, setForm] = useState({
		username: data?.username || '',
		location: data?.location || '',
		bio: data?.bio || '',
	});

	const debouncedUsername = useDebounce(form.username, 200);

	const { data: isUsernameAvailableData } = useIsUsernameAvailableQuery(debouncedUsername, {
		skip: !debouncedUsername,
	});

	const doesUsernameMeetRequirements = useMemo(
		() => form.username.length >= 5 && form.username.length <= 15,
		[form.username]
	);

	useEffect(() => {
		setForm({
			username: data?.username || '',
			location: data?.location || '',
			bio: data?.bio || '',
		});
	}, [data]);

	const handleFormChange = (key: string, value: string) => {
		setForm({ ...form, [key]: value });
	};

	const handleUpdateUser = async () => {
		if (!currentUser || !form.username) return;

		try {
			const token = await currentUser.getIdToken();

			await updateUser({
				authToken: token,
				username: form.username,
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
				<View>
					<TextInput
						error={!isUsernameAvailableData?.isAvailable || !doesUsernameMeetRequirements}
						mode="outlined"
						label="Username"
						onChange={(e) => handleFormChange('username', e.nativeEvent.text)}
						value={form.username}
					/>
					{isUsernameAvailableData?.success && !isUsernameAvailableData?.isAvailable && (
						<Text variant="labelMedium">Username is already taken</Text>
					)}
					{!doesUsernameMeetRequirements && (
						<Text variant="labelMedium">Username must be between 5 and 15 characters</Text>
					)}
				</View>

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
					<Button disabled={!form.username} onPress={handleUpdateUser} mode="contained">
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
