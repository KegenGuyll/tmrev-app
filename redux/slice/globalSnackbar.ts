import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type GlobalSnackbarInitialState = {
	visible: boolean;
	message: string;
	type: 'success' | 'error';
};

const initialState: GlobalSnackbarInitialState = {
	visible: false,
	message: '',
	type: 'success',
};

export const globalSnackbarSlice = createSlice({
	name: 'globalSnackbar',
	initialState,
	reducers: {
		showSnackbar: (
			state,
			action: PayloadAction<{ message: string; type: 'success' | 'error' }>
		) => {
			state.visible = true;
			state.message = action.payload.message;
			state.type = action.payload.type;
		},
		hideSnackbar: (state) => {
			state.visible = false;
		},
	},
});

export const { showSnackbar, hideSnackbar } = globalSnackbarSlice.actions;

export default globalSnackbarSlice.reducer;
