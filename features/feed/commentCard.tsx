import {
	StyleSheet,
	View,
	Image,
	TouchableWithoutFeedback,
	TouchableHighlight,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Divider, Button } from 'react-native-paper';
import dayjs from 'dayjs';
import { CommentWithUser } from '@/models/tmrev/comments';
import { feedReviewRoute, profileRoute } from '@/constants/routes';
import { numberShortHand } from '@/utils/common';

type CommentCardProps = {
	comment: CommentWithUser;
	displayMetaData?: boolean;
};

const CommentCard: React.FC<CommentCardProps> = ({
	comment,
	displayMetaData = true,
}: CommentCardProps) => {
	const styles = makeStyles();
	const router = useRouter();

	return (
		<TouchableHighlight onPress={() => router.push(feedReviewRoute(comment._id, 'comments'))}>
			<View style={[styles.flexColumn, { paddingHorizontal: 8, paddingVertical: 8 }]}>
				<View style={[styles.flexRow, { alignItems: 'flex-start', gap: 8, paddingBottom: 16 }]}>
					<Image
						source={{ uri: comment.user.photoUrl }}
						height={50}
						width={50}
						style={{ borderRadius: 100 }}
					/>
					<View style={{ gap: 16 }}>
						<TouchableWithoutFeedback
							onPress={() => router.navigate(profileRoute('home', comment.user.uuid))}
						>
							<View style={styles.flexColumn}>
								<Text variant="labelLarge">
									{comment.user.firstName} {comment.user.lastName}
								</Text>
								<Text variant="labelSmall">
									{dayjs(comment.createdAt).format('hh:mm A · MMM DD, YYYY')}
								</Text>
							</View>
						</TouchableWithoutFeedback>
						<View>
							<Text variant="bodyMedium">{comment.comment}</Text>
						</View>
					</View>
				</View>
				<Divider />
				{displayMetaData && (
					<View style={[styles.flexRow, { justifyContent: 'space-evenly', alignItems: 'center' }]}>
						<Button textColor="white" icon="thumb-up-outline">
							{comment.votes.upVote.length}
						</Button>
						<Button textColor="white" icon="thumb-down-outline">
							{comment.votes.downVote.length}
						</Button>
						<Button
							textColor="white"
							icon="comment-outline"
							style={[styles.flexRow, { alignItems: 'center' }]}
						>
							{numberShortHand(comment.replies)}
						</Button>

						<Button textColor="white" icon="share-outline">
							Share
						</Button>
					</View>
				)}
			</View>
		</TouchableHighlight>
	);
};

const makeStyles = () =>
	StyleSheet.create({
		flexColumn: {
			display: 'flex',
			flexDirection: 'column',
		},
		flexRow: {
			display: 'flex',
			flexDirection: 'row',
		},
	});

export default CommentCard;
