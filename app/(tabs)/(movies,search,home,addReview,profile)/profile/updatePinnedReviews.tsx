/* eslint-disable react/no-unstable-nested-components */
import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import {
	Button,
	Checkbox,
	MD3Theme,
	Searchbar,
	useTheme,
	Text,
	Snackbar,
} from 'react-native-paper';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import {
	useReviewControllerFindByUserId,
	useUserControllerGetPinnedReviews,
	useUserControllerAddPinnedReview,
	useUserControllerRemovePinnedReview,
	getUserControllerGetPinnedReviewsQueryKey,
	ReviewAggregated,
	ReviewControllerFindByUserIdParams,
} from '@/api/tmrev-api-v2';
import MovieReviewCard from '@/components/MovieReviewCard';
import { profileRoute } from '@/constants/routes';
import useDebounce from '@/hooks/useDebounce';

const pageSize = 15;
const MAX_PINNED_REVIEWS = 5;

const UpdatePinnedReviews = () => {
	const { currentUser } = useAuth({});
	const [pinnedReviews, setPinnedReviews] = useState<ReviewAggregated[]>([]);
	const [originalPinnedReviews, setOriginalPinnedReviews] = useState<ReviewAggregated[]>([]);
	const [search, setSearch] = useState('');
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const theme = useTheme();
	const styles = makeStyles(theme);
	const { width } = useWindowDimensions();
	const router = useRouter();
	const queryClient = useQueryClient();

	const debouncedSearchTerm = useDebounce(search, 500);

	const query: ReviewControllerFindByUserIdParams = useMemo(() => {
		if (debouncedSearchTerm) {
			return {
				sortBy: 'reviewedDate.desc',
				pageNumber: 1,
				pageSize,
				textSearch: debouncedSearchTerm,
			};
		}

		return { sortBy: 'reviewedDate.desc', pageNumber: 1, pageSize };
	}, [debouncedSearchTerm]);

	const { data: movieReviews } = useReviewControllerFindByUserId(currentUser?.uid || '', query, {
		query: { enabled: !!currentUser },
	});

	const { data: pinnedData } = useUserControllerGetPinnedReviews(currentUser?.uid || '', {
		query: { enabled: !!currentUser },
	});

	const addPinnedMutation = useUserControllerAddPinnedReview();
	const removePinnedMutation = useUserControllerRemovePinnedReview();

	useEffect(() => {
		if (pinnedData) {
			setPinnedReviews(pinnedData);
			setOriginalPinnedReviews(pinnedData);
		}
	}, [pinnedData]);

	const handleTogglePinnedReview = (reviewId: string) => {
		const doesReviewExist = pinnedReviews.findIndex((review) => review._id === reviewId);
		const review = movieReviews?.results?.find((r) => r._id === reviewId);

		if (!review) return;

		// Check if review is public
		if (!review.public) {
			setSnackbarMessage('Only public reviews can be pinned to your profile');
			setSnackbarVisible(true);
			return;
		}

		if (doesReviewExist === -1) {
			// Check if we've reached the limit
			if (pinnedReviews.length >= MAX_PINNED_REVIEWS) {
				setSnackbarMessage(`You can only pin up to ${MAX_PINNED_REVIEWS} reviews`);
				setSnackbarVisible(true);
				return;
			}
			setPinnedReviews([...pinnedReviews, review]);
		} else {
			setPinnedReviews(pinnedReviews.filter((r) => r._id !== reviewId));
		}
	};

	const handleUpdatePinnedReviews = async () => {
		if (!currentUser) return;

		setIsSaving(true);
		try {
			const originalIds = new Set(originalPinnedReviews.map((r) => r._id));
			const newIds = new Set(pinnedReviews.map((r) => r._id));

			// Find reviews to add and remove
			const toAdd = pinnedReviews.filter((r) => !originalIds.has(r._id));
			const toRemove = originalPinnedReviews.filter((r) => !newIds.has(r._id));

			// Execute all mutations in parallel
			const mutations = [
				...toAdd.map((review) => addPinnedMutation.mutateAsync({ reviewId: review._id, data: {} })),
				...toRemove.map((review) => removePinnedMutation.mutateAsync({ reviewId: review._id })),
			];

			await Promise.all(mutations);

			// Invalidate the pinned reviews cache using the exported query key
			await queryClient.invalidateQueries({
				queryKey: getUserControllerGetPinnedReviewsQueryKey(currentUser.uid),
			});

			if (router.canDismiss()) {
				router.dismiss();
			} else {
				router.replace(profileRoute('profile', currentUser.uid));
			}
		} catch (error) {
			console.error(error);
			setSnackbarMessage('Failed to update pinned reviews. Please try again.');
			setSnackbarVisible(true);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Update Pinned Reviews', headerRight: () => null }} />
			<View style={{ marginTop: 8, position: 'relative', gap: 8 }}>
				<Searchbar
					value={search}
					onChangeText={(t) => setSearch(t)}
					placeholder="Search for reviews"
				/>
				<View style={{ paddingHorizontal: 8, gap: 4 }}>
					<Text variant="titleSmall">
						Pinned Reviews: {pinnedReviews.length}/{MAX_PINNED_REVIEWS}
					</Text>
					<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
						Only public reviews can be pinned. Pinned reviews are displayed on your profile for
						others to see.
					</Text>
				</View>
				<Button
					onPress={handleUpdatePinnedReviews}
					style={{ width: '100%' }}
					mode="contained"
					disabled={isSaving}
					loading={isSaving}
				>
					Save
				</Button>
				{movieReviews?.results && (
					<FlatGrid
						ListHeaderComponentStyle={{
							display: 'flex',
							flexDirection: 'column',
							gap: 4,
							marginBottom: 8,
							width,
						}}
						ListHeaderComponent={() => (
							<View
								style={{
									width: '100%',
									gap: 4,
									padding: 4,
									flexDirection: 'column',
									display: 'flex',
									alignItems: 'center',
								}}
							/>
						)}
						itemDimension={400}
						style={styles.list}
						data={movieReviews.results}
						itemContainerStyle={{ maxHeight: 170 }}
						contentContainerStyle={{ paddingBottom: 120 }}
						spacing={8}
						stickyHeaderIndices={[0]}
						renderItem={({ item }) => {
							const isPrivate = !item.public;
							const isChecked = pinnedReviews.some((v) => v._id === item._id);
							return (
								<View
									style={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										gap: 4,
										opacity: isPrivate ? 0.5 : 1,
									}}
								>
									<Checkbox.Android
										status={isChecked ? 'checked' : 'unchecked'}
										disabled={isPrivate}
										onPress={() => handleTogglePinnedReview(item._id)}
									/>
									<View style={{ width: '90%' }}>
										<MovieReviewCard
											onPress={() => !isPrivate && handleTogglePinnedReview(item._id)}
											from="profile"
											review={item}
										/>
										{isPrivate && (
											<View
												style={{
													position: 'absolute',
													top: 8,
													right: 8,
													backgroundColor: theme.colors.errorContainer,
													paddingHorizontal: 8,
													paddingVertical: 4,
													borderRadius: 4,
												}}
											>
												<Text variant="labelSmall" style={{ color: theme.colors.onErrorContainer }}>
													Private
												</Text>
											</View>
										)}
									</View>
								</View>
							);
						}}
						keyExtractor={(item) => item._id.toString()}
					/>
				)}
			</View>
			<Snackbar
				visible={snackbarVisible}
				onDismiss={() => setSnackbarVisible(false)}
				duration={3000}
			>
				{snackbarMessage}
			</Snackbar>
		</>
	);
};

export default UpdatePinnedReviews;

const makeStyles = ({ colors }: MD3Theme) =>
	StyleSheet.create({
		bottomSheetContainer: {
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			backgroundColor: colors.background,
			padding: 16,
			gap: 32,
		},
		container: {
			flex: 1,
		},
		list: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
		},
	});
