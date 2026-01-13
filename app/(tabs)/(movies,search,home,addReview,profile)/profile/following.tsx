/* eslint-disable react-native/no-color-literals */
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Image, View } from 'react-native';
import { Text, Button, Searchbar, Divider } from 'react-native-paper';
import React, { useMemo, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import useAuth from '@/hooks/useAuth';
import { FromLocation } from '@/models';
import { profileRoute } from '@/constants/routes';
import {
	useUserControllerGetFollowing,
	useUserControllerFollowUser,
	useUserControllerUnfollowUser,
	UserProfile,
} from '@/api/tmrev-api-v2';
import useDebounce from '@/hooks/useDebounce';

type FollowerSearchParams = {
	userId: string;
	from?: FromLocation;
};

type FollowerItemProps = {
	item: UserProfile;
	isCurrentUser?: boolean;
	from?: FromLocation;
};

const FollowingItem: React.FC<FollowerItemProps> = ({
	item,
	from,
	isCurrentUser,
}: FollowerItemProps) => {
	const [isFollowing, setIsFollowing] = useState<boolean>(true);
	const { mutateAsync: followUser } = useUserControllerFollowUser();
	const { mutateAsync: unFollowUser } = useUserControllerUnfollowUser();

	const handleFollowButton = async () => {
		if (isFollowing) {
			await unFollowUser({ id: item.uuid, data: {} });
		} else {
			await followUser({ id: item.uuid, data: {} });
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
						{item.username}
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
	const { currentUser } = useAuth({});

	const debouncedSearchTerm = useDebounce(search, 500);

	const { data, isLoading, isFetching } = useUserControllerGetFollowing(
		userId!,
		debouncedSearchTerm ? { search: debouncedSearchTerm } : undefined,
		{
			query: {
				enabled: !!userId,
				placeholderData: (previousData) => previousData,
			},
		}
	);

	const isCurrentUser = useMemo(() => currentUser?.uid === userId, [currentUser, userId]);

	if (isLoading && !data) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{ title: `${data?.totalCount ?? 0} Following`, headerRight: () => null }}
			/>
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
					data={data?.results}
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
