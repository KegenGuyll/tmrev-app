/* eslint-disable react-native/no-color-literals */
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Image, View } from 'react-native';
import { Text, Button, Searchbar, Divider } from 'react-native-paper';
import { useMemo, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import { FromLocation } from '@/models';
import { useGetFollowersV2Query } from '@/redux/api/tmrev';
import { BasicUserV2 } from '@/models/tmrev/user';
import { profileRoute } from '@/constants/routes';
import useDebounce from '@/hooks/useDebounce';

type FollowerSearchParams = {
	userId: string;
	from?: FromLocation;
};

type FollowerItemProps = {
	item: BasicUserV2;
	isCurrentUser?: boolean;
	from?: FromLocation;
};

const FollowerItem: React.FC<FollowerItemProps> = ({
	item,
	from,
	isCurrentUser,
}: FollowerItemProps) => {
	return (
		<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 8 }}>
			<Link style={{ flexGrow: 1 }} href={profileRoute(from || 'home', item.uuid)}>
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
			{isCurrentUser && (
				<Button mode="text" disabled>
					Remove
				</Button>
			)}
		</View>
	);
};

const Followers: React.FC = () => {
	const { userId, from } = useLocalSearchParams<FollowerSearchParams>();
	const [search, setSearch] = useState<string>('');

	const debouncedSearchTerm = useDebounce(search, 500);

	const { currentUser } = auth();

	const { data, isLoading } = useGetFollowersV2Query(
		{ uid: userId!, query: { search: debouncedSearchTerm } },
		{ skip: !userId }
	);

	const isCurrentUser = useMemo(() => currentUser?.uid === userId, [currentUser, userId]);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{ title: `${data?.body.length} Followers`, headerRight: () => null }}
			/>
			<View style={{ padding: 8, gap: 16 }}>
				<Searchbar
					value={search}
					onChangeText={(t) => setSearch(t)}
					mode="bar"
					placeholder="Search"
				/>
				<Divider />
				<Text variant="titleMedium">All Followers</Text>
				<FlatList
					data={data?.body}
					renderItem={({ item }) => (
						<FollowerItem isCurrentUser={isCurrentUser} item={item} from={from} />
					)}
					keyExtractor={(item) => item._id}
				/>
			</View>
		</>
	);
};

export default Followers;
