import { combineReducers } from 'redux';
import counterReducer from '../slice/counterSlice';
import { pokemonApi } from '../api/pokemonApi';
import { movieApi } from '../api/tmdb/movieApi';

const rootReducer = combineReducers({
	counter: counterReducer,
	[pokemonApi.reducerPath]: pokemonApi.reducer,
	[movieApi.reducerPath]: movieApi.reducer,
});

export default rootReducer;
