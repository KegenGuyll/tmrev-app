import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import JustReviewedMovies from '@/features/justReviewedMovies';
import MostReviewedMovies from '@/features/mostReviewedMovies';

const HomeScreen = () => {
	return (
		<>
			<Stack.Screen options={{ headerShown: false, title: 'Home Page' }} />
			<SafeAreaView>
				<JustReviewedMovies posterSelectionLocation="home" />
				<MostReviewedMovies posterSelectionLocation="home" />
			</SafeAreaView>
		</>
	);
};

export default HomeScreen;
