export interface MovieGenreInsightResponse {
	success: boolean;
	data: MovieGenreInsightData;
}

export interface MovieGenreInsightData {
	favoriteGenres: string[];
	leastFavoriteGenres: string[];
	mostWatchedGenres: MostWatchedGenre[];
	mostReviewedGenres: MostReviewedGenre[];
	mostReviewedRankedGenres: MostReviewedRankedGenre[];
	leastReviewedRankedGenres: LeastReviewedRankedGenre[];
	bestAdvancedScoreRankedGenres: BestAdvancedScoreRankedGenres;
	worstAdvancedScoreRankedGenres: WorstAdvancedScoreRankedGenres;
}

export interface MostWatchedGenre {
	label: string;
	value: number;
}

export interface MostReviewedGenre {
	label: string;
	value: number;
}

export interface MostReviewedRankedGenre {
	label: string;
	value: number;
}

export interface LeastReviewedRankedGenre {
	label: string;
	value: number;
}

export interface BestAdvancedScoreRankedGenres {
	acting: Acting[];
	characters: Character[];
	cinematography: Cinematography[];
	climax: Climax[];
	ending: Ending[];
	music: Music[];
	personalScore: PersonalScore[];
	plot: Plot[];
	theme: Theme[];
	visuals: Visual[];
}

export interface Acting {
	label: string;
	value: number;
}

export interface Character {
	label: string;
	value: number;
}

export interface Cinematography {
	label: string;
	value: number;
}

export interface Climax {
	label: string;
	value: number;
}

export interface Ending {
	label: string;
	value: number;
}

export interface Music {
	label: string;
	value: number;
}

export interface PersonalScore {
	label: string;
	value: number;
}

export interface Plot {
	label: string;
	value: number;
}

export interface Theme {
	label: string;
	value: number;
}

export interface Visual {
	label: string;
	value: number;
}

export interface WorstAdvancedScoreRankedGenres {
	acting: Acting2[];
	characters: Character2[];
	cinematography: Cinematography2[];
	climax: Climax2[];
	ending: Ending2[];
	music: Music2[];
	personalScore: PersonalScore2[];
	plot: Plot2[];
	theme: Theme2[];
	visuals: Visual2[];
}

export interface Acting2 {
	label: string;
	value: number;
}

export interface Character2 {
	label: string;
	value: number;
}

export interface Cinematography2 {
	label: string;
	value: number;
}

export interface Climax2 {
	label: string;
	value: number;
}

export interface Ending2 {
	label: string;
	value: number;
}

export interface Music2 {
	label: string;
	value: number;
}

export interface PersonalScore2 {
	label: string;
	value: number;
}

export interface Plot2 {
	label: string;
	value: number;
}

export interface Theme2 {
	label: string;
	value: number;
}

export interface Visual2 {
	label: string;
	value: number;
}

type ActorInsightData = {
	id: number;
	name: string;
	count: number;
	details: {
		adult: boolean;
		gender: number;
		known_for_department: string;
		name: string;
		original_name: string;
		popularity: number;
		profile_path: string;
	};
};

export type ActorInsightResponse = {
	success: boolean;
	watchedActorMapSorted: ActorInsightData[];
	reviewedActorMapSorted: ActorInsightData[];
};
