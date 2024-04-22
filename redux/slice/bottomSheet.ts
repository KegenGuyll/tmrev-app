import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type MoviePosterQuickActionData = {
	movieId: number;
	moviePoster: string | null | undefined;
};

type InitialState = {
	visible: boolean;
	moviePosterQuickActionData: MoviePosterQuickActionData | null;
};

const initialState: InitialState = {
	visible: false,
	moviePosterQuickActionData: null,
};

export const bottomSheetSlice = createSlice({
	name: 'bottomSheet',
	initialState,
	reducers: {
		setVisibility: (state, action: PayloadAction<boolean>) => {
			state.visible = action.payload;
		},
		setMoviePosterQuickActionData: (state, action: PayloadAction<MoviePosterQuickActionData>) => {
			state.moviePosterQuickActionData = action.payload;
		},
	},
});

export const { setVisibility, setMoviePosterQuickActionData } = bottomSheetSlice.actions;

export default bottomSheetSlice.reducer;
