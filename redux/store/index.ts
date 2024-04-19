import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers';
import { pokemonApi } from '../api/pokemonApi';
import { movieApi } from '../api/tmdb/movieApi';

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		})
			.concat(pokemonApi.middleware)
			.concat(movieApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
