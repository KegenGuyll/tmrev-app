import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { ProfileSearchParams } from '.';
import { useGetUserQuery } from '@/redux/api/tmrev';
import MovieReviewCard from '@/components/MovieReviewCard';

const AllReviews = () => {
	const { profileId } = useLocalSearchParams<ProfileSearchParams>();
	const { data, isLoading } = useGetUserQuery({ uid: profileId }, { skip: !profileId });

	const name = useMemo(() => {
		if (data) {
			return `${data.firstName} ${data.lastName}`;
		}

		return '';
	}, [data]);

	if (isLoading || !data) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen options={{ title: `${name} Reviews` }} />
			<View>
				{!data.reviews.length ? (
					<Text>No reviews found</Text>
				) : (
					<FlatGrid
						itemDimension={200}
						style={styles.list}
						data={data.reviews}
						spacing={8}
						renderItem={({ item }) => <MovieReviewCard review={item} />}
						keyExtractor={(item) => item._id.toString()}
					/>
				)}
			</View>
		</>
	);
};

export default AllReviews;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	list: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
});
