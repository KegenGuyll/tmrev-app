import React from 'react';
import { Stack } from 'expo-router';

type DynamicLayoutProps = {
	// eslint-disable-next-line react/no-unused-prop-types
	segment: string;
};

// eslint-disable-next-line no-empty-pattern
const DynamicLayout = ({}: DynamicLayoutProps) => {
	return <Stack screenOptions={{ headerShown: true, headerTintColor: 'white' }} />;
};

export default DynamicLayout;
