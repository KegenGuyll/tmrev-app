import React from 'react';
import auth from '@react-native-firebase/auth';
import { Stack, useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { notificationsRoute } from '@/constants/routes';
import { FromLocation } from '@/models';

type DynamicLayoutProps = {
	segment: string;
};

const DynamicLayout = ({ segment }: DynamicLayoutProps) => {
	const router = useRouter();

	const { currentUser } = auth();

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerTintColor: 'white',
				title: '',
				headerRight: () => {
					if (!currentUser) return null;

					return (
						<IconButton
							onPress={() => router.navigate(notificationsRoute(segment as FromLocation))}
							icon="bell-outline"
						/>
					);
				},
			}}
		/>
	);
};

export default DynamicLayout;
