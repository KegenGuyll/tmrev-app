/* eslint-disable react-native/no-color-literals */
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Image, View } from 'react-native';
import { Text, Button, Searchbar, Divider } from 'react-native-paper';
import { useMemo, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import { FromLocation } from '@/models';
import {
	useFollowUserV2Mutation,
	useGetFollowingV2Query,
	useUnfollowUserV2Mutation,
} from '@/redux/api/tmrev';
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

const FollowingItem: React.FC<FollowerItemProps> = ({
	item,
	from,
	isCurrentUser,
}: FollowerItemProps) => {
	const [isFollowing, setIsFollowing] = useState<boolean>(true);
	const [followUser] = useFollowUserV2Mutation();
	const [unFollowUser] = useUnfollowUserV2Mutation();

	const handleFollowButton = () => {
		if (isFollowing) {
			unFollowUser({ userUid: item.uuid });
		} else {
			followUser({ userUid: item.uuid });
		}

		setIsFollowing(!isFollowing);
	};

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
					<Text ellipsizeMode="tail" numberOfLines={1} style={{ width: 175 }} variant="labelLarge">
						{item.firstName} {item.lastName}
					</Text>
				</View>
			</Link>
			{isCurrentUser && (
				<Button onPress={handleFollowButton} mode="text">
					{isFollowing ? 'Unfollow' : 'Follow'}
				</Button>
			)}
		</View>
	);
};

const Following: React.FC = () => {
	const { userId, from } = useLocalSearchParams<FollowerSearchParams>();
	const [search, setSearch] = useState<string>('');
	const { currentUser } = auth();

	const debouncedSearchTerm = useDebounce(search, 500);

	const { data, isLoading } = useGetFollowingV2Query(
		{ uid: userId!, query: { search: debouncedSearchTerm } },
		{ skip: !userId }
	);

	const isCurrentUser = useMemo(() => currentUser?.uid === userId, [currentUser, userId]);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen options={{ title: `${data?.body.length} Following` }} />
			<View style={{ padding: 8, gap: 16 }}>
				<Searchbar
					value={search}
					onChangeText={(t) => setSearch(t)}
					mode="bar"
					placeholder="Search"
				/>
				<Divider />
				<Text variant="titleMedium">All Following</Text>
				<FlatList
					data={data?.body}
					renderItem={({ item }) => (
						<FollowingItem item={item} from={from} isCurrentUser={isCurrentUser} />
					)}
					keyExtractor={(item) => item._id}
				/>
			</View>
		</>
	);
};

export default Following;
