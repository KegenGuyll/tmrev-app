/* eslint-disable react-native/no-color-literals */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View, Image, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import React, { useEffect, useRef, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import {
	useReviewControllerFindOne,
	useUserControllerFindOne,
	useCommentControllerFindOne,
} from '@/api/tmrev-api-v2/endpoints';
import { CommentPostType } from '@/api/tmrev-api-v2';
import useCommentMutations from '@/hooks/useCommentMutations';
import MultiLineInput from '@/components/Inputs/MultiLineInput';
import { FeedReviewContentTypes, feedReviewRoute } from '@/constants/routes';
import ReviewCard from '@/features/feed/reviewCard';
import CommentCard from '@/features/feed/commentCard';
import { FromLocation } from '@/models';

type ReplyPostSearchParams = {
	postId: string;
	contentType: FeedReviewContentTypes;
	from: FromLocation;
};

const ReplyPost: React.FC = () => {
	const theme = useTheme();
	const { postId, contentType, from } = useLocalSearchParams<ReplyPostSearchParams>();
	const inputRef = useRef<TextInput>(null);
	const commentAreaRef = useRef<View>(null);
	const [reply, setReply] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { currentUser } = useAuth({});
	const { data: commentData, isLoading: isCommentLoading } = useCommentControllerFindOne(postId!, {
		query: { enabled: !!postId && contentType === 'comments' },
	});
	const { data: reviewData } = useReviewControllerFindOne(postId!, {
		query: { enabled: !!postId && contentType === 'reviews' },
	});

	const { createComment, isCreating } = useCommentMutations(postId);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [inputRef]);

	const handlePost = async () => {
		if (!contentType) return;
		setIsLoading(true);
		await createComment({
			comment: reply,
			postId: postId!,
			authorId: reviewData ? reviewData.userId : commentData!.author.uuid,
			postType: contentType as CommentPostType,
		});
		setIsLoading(false);
		router.replace(feedReviewRoute(postId!, contentType, from!));
	};

	const { data: currentUserData } = useUserControllerFindOne(currentUser?.uid || '', {
		query: { enabled: !!currentUser },
	});

	if ((contentType === 'comments' && !commentData) || isCommentLoading) {
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					title: 'Reply',
					headerRight: () => <Button onPress={handlePost}>Post</Button>,
				}}
			/>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={113}
			>
				<ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
					{(isLoading || isCreating) && <ActivityIndicator />}
					{reviewData && contentType === 'reviews' && (
						<ReviewCard reviewData={reviewData} displayMetaData={false} from={from!} />
					)}
					{commentData && contentType === 'comments' && (
						<CommentCard comment={commentData} displayMetaData={false} from={from!} />
					)}
					<View
						style={{
							borderRightWidth: 3,
							borderColor: 'gray',
							width: 20,
							height: 32,
						}}
					/>
					<View
						ref={commentAreaRef}
						style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}
					>
						{currentUserData?.photoUrl ? (
							<Image
								source={{ uri: currentUserData.photoUrl }}
								height={50}
								width={50}
								style={{ borderRadius: 100 }}
							/>
						) : (
							<View
								style={{
									height: 50,
									width: 50,
									borderRadius: 100,
									backgroundColor: theme.colors.primary,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Text style={{ color: theme.colors.onPrimary }}>
									{currentUserData?.username?.charAt(0).toUpperCase()}
								</Text>
							</View>
						)}
						<View style={{ gap: 16, width: '100%', flex: 1 }}>
							<View>
								<Text variant="labelLarge">{currentUserData?.username}</Text>
							</View>
							<View>
								<MultiLineInput
									ref={inputRef}
									height={200}
									inputStyle={{ width: '100%', backgroundColor: theme.colors.backdrop }}
									placeholder="Reply to this post"
									value={reply}
									numberOfLines={12}
									onChangeText={setReply}
								/>
							</View>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</>
	);
};

export default ReplyPost;
