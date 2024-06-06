/* eslint-disable react-native/no-color-literals */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View, Image, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import { Button, Text, useTheme } from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
import {
	useAddCommentMutation,
	useGetCommentDetailsQuery,
	useGetSingleReviewQuery,
	useGetV2UserQuery,
} from '@/redux/api/tmrev';
import MultiLineInput from '@/components/Inputs/MultiLineInput';
import { FeedReviewContentTypes } from '@/constants/routes';
import ReviewCard from '@/features/feed/reviewCard';
import CommentCard from '@/features/feed/commentCard';

type ReplyPostSearchParams = {
	postId: string;
	contentType: FeedReviewContentTypes;
};

const ReplyPost: React.FC = () => {
	const theme = useTheme();
	const { postId, contentType } = useLocalSearchParams<ReplyPostSearchParams>();
	const inputRef = useRef<TextInput>(null);
	const commentAreaRef = useRef<View>(null);
	const [reply, setReply] = useState<string>('');

	const { currentUser } = auth();
	const { data: commentData, isLoading: isCommentLoading } = useGetCommentDetailsQuery(postId!, {
		skip: !postId || contentType !== 'comments',
	});
	const { data: reviewData } = useGetSingleReviewQuery(
		{ reviewId: postId! },
		{ skip: !postId || contentType !== 'reviews' }
	);

	const [addComment] = useAddCommentMutation();

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [inputRef]);

	const handlePost = async () => {
		if (!contentType) return;

		await addComment({
			comment: reply,
			id: postId!,
			contentType,
		}).unwrap();
		router.dismiss();
	};

	const { data: currentUserData } = useGetV2UserQuery(
		{ uid: currentUser!.uid! },
		{ skip: !currentUser }
	);

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
					{reviewData && contentType === 'reviews' && (
						<ReviewCard reviewData={reviewData} numberOfComments={0} displayMetaData={false} />
					)}
					{commentData && contentType === 'comments' && (
						<CommentCard comment={commentData.body} displayMetaData={false} />
					)}
					{/* <View
						style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}
					>
						<Image
							source={{ uri: commentData.body.user.photoUrl }}
							height={50}
							width={50}
							style={{ borderRadius: 100 }}
						/>
						<View style={{ gap: 16 }}>
							<View>
								<Text variant="labelLarge">
									{commentData.body.user.firstName} {commentData.body.user.lastName}
								</Text>
								<Text variant="labelSmall">
									{dayjs(commentData.body.createdAt).format('hh:mm A · MMM DD, YYYY')}
								</Text>
							</View>
							<View>
								<Text variant="bodyMedium">{commentData.body.comment}</Text>
							</View>
						</View>
					</View> */}
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
						<Image
							source={{ uri: currentUserData?.body.photoUrl }}
							height={50}
							width={50}
							style={{ borderRadius: 100 }}
						/>
						<View style={{ gap: 16, width: '100%', flex: 1 }}>
							<View>
								<Text variant="labelLarge">
									{currentUserData?.body.firstName} {currentUserData?.body.lastName}
								</Text>
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
