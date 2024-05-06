/* eslint-disable react-native/no-color-literals */
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Image, View } from 'react-native';
import { Text, Button, Searchbar, Divider } from 'react-native-paper';
import { useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { FromLocation } from '@/models';
import { useGetFollowersV2Query } from '@/redux/api/tmrev';
import { BasicUserV2 } from '@/models/tmrev/user';

type FollowerSearchParams = {
	userId: string;
	from?: FromLocation;
};

type FollowerItemProps = {
	item: BasicUserV2;
	from?: FromLocation;
};

const FollowerItem: React.FC<FollowerItemProps> = ({ item, from }: FollowerItemProps) => {
	return (
		<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 8 }}>
			<Link style={{ flexGrow: 1 }} href={`/(tabs)/(${from || 'home'})/profile/${item.uuid}`}>
				<View
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: 8,
					}}
				>
					<Image
						style={{ borderRadius: 50, borderColor: 'grey', borderWidth: 2 }}
						source={{ uri: item.photoUrl }}
						height={52}
						width={52}
					/>
					<Text variant="labelLarge">
						{item.firstName} {item.lastName}
					</Text>
				</View>
			</Link>
			<Button mode="text" disabled>
				Remove
			</Button>
		</View>
	);
};

const Followers: React.FC = () => {
	const { userId, from } = useLocalSearchParams<FollowerSearchParams>();
	const [search, setSearch] = useState<string>('');

	const { data, isLoading } = useGetFollowersV2Query({ uid: userId, query: { search } });

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen options={{ title: `${data?.body.length} Followers` }} />
			<View style={{ padding: 8, gap: 16 }}>
				<Searchbar
					value={search}
					onChange={(e) => setSearch(e.nativeEvent.text)}
					mode="bar"
					placeholder="Search"
				/>
				<Divider />
				<Text variant="titleMedium">All Followers</Text>
				<FlatList
					data={data?.body}
					renderItem={({ item }) => <FollowerItem item={item} from={from} />}
					keyExtractor={(item) => item._id}
				/>
			</View>
		</>
	);
};

export default Followers;
