import React from 'react';
import { Stack } from 'expo-router';

type DynamicLayoutProps = {
	segment: string;
};

const DynamicLayout = ({ segment }: DynamicLayoutProps) => {
	if (segment === '(profile)' || segment === '(addReview)')
		return <Stack screenOptions={{ headerShown: false }} />;

	return <Stack screenOptions={{ headerShown: true }} />;
};

export default DynamicLayout;
