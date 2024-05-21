const imageUrl = (path: string, w?: number | string, resized = true) => {
	if (w === 'original') {
		return `https://image.tmdb.org/t/p/original${path}`;
	}

	if (resized && w) {
		return `https://image.tmdb.org/t/p/w${w}${path}`;
	}

	return `https://image.tmdb.org/t/p/original${path}`;
};

export default imageUrl;
