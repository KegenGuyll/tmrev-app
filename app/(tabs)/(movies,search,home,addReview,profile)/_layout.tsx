/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Badge, IconButton } from 'react-native-paper';
import { View } from 'react-native';
import { notificationsRoute } from '@/constants/routes';
import { FromLocation } from '@/models';
import useAuth from '@/hooks/useAuth';
import { useNotificationControllerGetCount } from '@/api/tmrev-api-v2';

type DynamicLayoutProps = {
	segment: string;
};

const segmentToTitle = (segment: string) => {
	switch (segment) {
		case '(movies)':
			return 'Movies';
		case '(search)':
			return 'Search';
		case '(home)':
			return 'Home';
		case '(addReview)':
			return 'Add Review';
		case '(profile)':
			return 'Profile';
		default:
			return 'Movies';
	}
};

const DynamicLayout = ({ segment }: DynamicLayoutProps) => {
	const router = useRouter();

	const { currentUser } = useAuth({});

	const { data: notificationCountData } = useNotificationControllerGetCount(undefined, {
		query: {
			enabled: !!currentUser,
		},
	});

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerTintColor: 'white',
				title: segmentToTitle(segment),
				headerRight: () => {
					if (!currentUser) return null;

					return (
						<View style={{ position: 'relative' }}>
							<IconButton
								onPress={() => router.navigate(notificationsRoute(segment as FromLocation))}
								icon="bell-outline"
							/>
							{!!notificationCountData && (
								<View style={{ position: 'absolute', top: 0, right: 0 }}>
									<Badge visible={(notificationCountData?.count || 0) > 0} size={20}>
										{notificationCountData.count}
									</Badge>
								</View>
							)}
						</View>
					);
				},
			}}
		/>
	);
};

export default DynamicLayout;
