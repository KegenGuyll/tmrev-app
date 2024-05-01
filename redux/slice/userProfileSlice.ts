import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TmrevUser } from '@/models/tmrev/user';

type InitialState = {
	user: TmrevUser | null;
};

const initialState: InitialState = {
	user: null,
};

export const userProfileSlice = createSlice({
	name: 'userProfile',
	initialState,
	reducers: {
		setUserProfile: (state, action: PayloadAction<TmrevUser>) => {
			state.user = action.payload;
		},
	},
});

export const { setUserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;
