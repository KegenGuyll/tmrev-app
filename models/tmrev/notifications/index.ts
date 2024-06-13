/* eslint-disable no-unused-vars */

import { Comment } from '../comments';
import { TmrevReview } from '../review';
import { TmrevUser } from '../user';

export enum NotificationTypes {
	UP_VOTE = 'upVote',
	DOWN_VOTE = 'downVote',
	REPLY = 'reply',
	FOLLOW = 'follow',
	UN_FOLLOW = 'unfollow',
}

type NotificationType = 'like' | 'dislike' | 'comment' | 'viewed';
type NotificationContentType = 'comments' | 'reviews' | 'watchlists';
type NotificationContent = {
	title: string;
	body: string;
};

type NotificationV2Response = {
	success: boolean;
	body: NotificationReview[] | NotificationComment[];
};

type Notification<T> = {
	_id: string;
	notificationType: NotificationType;
	contentId: string;
	recipient: string;
	sender: {
		_id: string;
		username: string;
		uuid: string;
		photoUrl: string;
	};
	content: T;
	notificationContent: NotificationContent;
	isRead: boolean;
	createdAt: string;
};

type NotificationQueryV2 = {
	contentType: NotificationContentType;
};

type NotificationReview = Notification<TmrevReview> & {
	contentType: 'reviews';
};

type NotificationComment = Notification<Comment> & {
	contentType: 'comments';
};

type NotificationCountResponse = {
	success: boolean;
	body: number;
};

interface IRetrieveNotificationQuery {
	params?: {
		read?: boolean;
	};
}

interface IUpdateNotificationQuery {
	notificationId: string;
}

interface INotificationResponseGeneric {
	_id: string;
	recipient: TmrevUser;
	sender: TmrevUser;
	read: boolean;
	type: NotificationTypes;
}

interface INotificationResponseComment extends INotificationResponseGeneric {
	message: string;
	replyId: string;
	reviewId: string;
	review: TmrevReview;
	type: NotificationTypes.REPLY;
}

interface INotificationResponseVote extends INotificationResponseGeneric {
	reviewId: string;
	review: TmrevReview;
	type: NotificationTypes.UP_VOTE | NotificationTypes.DOWN_VOTE;
}

interface INotificationResponseFollow extends INotificationResponseGeneric {
	message: string;
	replyId: string;
	type: NotificationTypes.FOLLOW | NotificationTypes.UN_FOLLOW;
}

interface INotificationResponse {
	success: boolean;
	body: NotificationResult[];
}

type NotificationResult =
	| INotificationResponseComment
	| INotificationResponseVote
	| INotificationResponseFollow;

export type {
	INotificationResponse,
	INotificationResponseComment,
	INotificationResponseFollow,
	INotificationResponseGeneric,
	INotificationResponseVote,
	IRetrieveNotificationQuery,
	IUpdateNotificationQuery,
	NotificationResult,
	Notification,
	NotificationComment,
	NotificationReview,
	NotificationQueryV2,
	NotificationV2Response,
	NotificationContent,
	NotificationContentType,
	NotificationType,
	NotificationCountResponse,
};
