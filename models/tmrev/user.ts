import type { TmrevReview, WatchList } from '.';

type Link = {
	title: string;
	link: string;
};
interface TmrevUser {
	_id: string;
	email: string;
	uuid: string;
	following: string[];
	firstName: string;
	lastName: string;
	public: boolean;
	bio: string;
	location: string;
	link?: Link;
}

interface User {
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
	link: {
		title: string;
		url: string;
	};
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

export type { Link, TmrevUser, User, UserQuery, UpdateUserQuery };
