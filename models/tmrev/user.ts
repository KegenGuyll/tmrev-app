import type { TmrevReview, WatchList } from '.';
import ISO3166_1 from '../tmdb/ISO3166-1';

type Link = {
	title: string;
	link: string;
};

interface TmrevUser {
	displayName?: string;
	photoUrl?: string;
	email: string;
	_id: string;
	uuid: string;
	following: string[];
	reviews: TmrevReview[];
	watchLists: WatchList[];
	username: string;
	link?: Link;
	bio: string;
	location: string;
	public: boolean;
	followers: string[];
}

interface UserQuery {
	uid: string;
	authToken?: string;
}

type UpdateUserQuery = {
	authToken?: string;
	username?: string;
	bio?: string;
	location?: string;
};

type UserV2 = {
	_id: string;
	uuid: string;
	username: string;
	bio: string;
	location: string;
	photoUrl: string;
	reviewCount: number;
	listCount: number;
	watchedCount: number;
	followerCount: number;
	followingCount: number;
	isFollowing: boolean;
	countryCode: ISO3166_1;
};

type IsUsernameAvailableResponse = {
	success: boolean;
	isAvailable: boolean;
};

type BasicUserV2 = {
	_id: string;
	uuid: string;
	username: string;
	bio: string;
	location: string;
	photoUrl: string;
	createdAt: string;
	email: string;
	followers: string[];
	following: string[];
	link: Link | null;
	public: boolean;
	updatedAt: string;
};

type GetFollowResponse = {
	success: boolean;
	body: BasicUserV2[];
};

type GetFollowPayload = {
	uid: string;
	query?: {
		search?: string;
	};
};

type GetUserV2Response = {
	success: boolean;
	body: UserV2;
};

type GetUserV2Payload = {
	uid: string;
	authToken?: string;
};

type FollowUserV2Payload = {
	userUid: string;
};

type FollowUserV2Response = {
	success: boolean;
};

type DeviceTokenPayload = {
	deviceToken: string;
};

type IsDeviceTokenSavedResponse = {
	success: boolean;
	saved: boolean;
};

type DeleteDeviceTokenResponse = {
	success: boolean;
};

export type {
	Link,
	TmrevUser,
	TmrevUser as User,
	UserQuery,
	UpdateUserQuery,
	UserV2,
	GetUserV2Response,
	GetUserV2Payload,
	FollowUserV2Payload,
	FollowUserV2Response,
	BasicUserV2,
	GetFollowResponse,
	GetFollowPayload,
	IsUsernameAvailableResponse,
	DeviceTokenPayload,
	IsDeviceTokenSavedResponse,
	DeleteDeviceTokenResponse,
};
