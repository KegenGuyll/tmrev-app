/* eslint-disable import/no-cycle */
import { TmrevReview } from './review';

type Comment = {
	_id: string;
	author?: string;
	comment: string;
	createdAt: string;
	updatedAt: string;
	post: Post;
	votes: Vote;
};

type CommentWithUser = Comment & {
	user: {
		firstName: string;
		lastName: string;
		photoUrl: string;
		_id: string;
		uuid: string;
	};
	postDetails: TmrevReview;
	replies: number;
};

type GetCommentsResponse = {
	success: boolean;
	body: CommentWithUser[];
};

type GetCommentResponse = {
	success: boolean;
	body: GetCommentBody;
};

type GetCommentBody = CommentWithUser & {
	postDetails: TmrevReview;
};

type Post = {
	author: string;
	id: string;
	type: string;
};

type Vote = {
	upVote: string[];
	downVote: string[];
};

export type { Comment, Post, Vote, GetCommentsResponse, CommentWithUser, GetCommentResponse };
