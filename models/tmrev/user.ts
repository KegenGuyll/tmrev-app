import type { TmrevReview, WatchList } from '.';

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
	firstName: string;
	lastName: string;
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
	firstName?: string;
	lastName?: string;
	bio?: string;
	location?: string;
};

export type { Link, TmrevUser, TmrevUser as User, UserQuery, UpdateUserQuery };
