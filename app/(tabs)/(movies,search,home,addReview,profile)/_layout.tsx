/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import auth from '@react-native-firebase/auth';
import { Stack, useRouter } from 'expo-router';
import { Badge, IconButton } from 'react-native-paper';
import { View } from 'react-native';
import { notificationsRoute } from '@/constants/routes';
import { FromLocation } from '@/models';
import { useGetNotificationCountQuery } from '@/redux/api/tmrev';

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

	const { currentUser } = auth();

	const { data: notificationCountData } = useGetNotificationCountQuery(undefined, {
		skip: !currentUser,
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
							{!!notificationCountData?.body && (
								<View style={{ position: 'absolute', top: 0, right: 0 }}>
									<Badge visible={notificationCountData.body > 0} size={20}>
										{notificationCountData.body}
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
