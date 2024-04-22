export function numberShortHand(number: number): string {
	return Intl.NumberFormat('en-US', {
		maximumFractionDigits: 1,
		notation: 'compact',
	}).format(number);
}

export function formatRuntime(runtime: number): string {
	console.log(runtime);
	const hours = runtime / 60;
	const rhours = Math.floor(hours);
	const minutes = (hours - rhours) * 60;
	const rminutes = Math.round(minutes);

	return `${rhours}h ${rminutes}m`;
}

export function extractNameFromEmail(email: string | null): string {
	if (!email) return '';

	return email.split('@')[0];
}

export function extractNameFromDisplayName(displayName: string | null) {
	if (!displayName) return null;

	const spreadName = displayName.split(' ');

	if (spreadName.length === 1) return { firstName: spreadName[0] };

	return {
		firstName: spreadName[0],
		lastName: spreadName[1],
	};
}

export function extractName(displayName: string | null, email: string) {
	if (!displayName) {
		return {
			firstName: extractNameFromEmail(email),
			lastName: extractNameFromEmail(email),
		};
	}

	return extractNameFromDisplayName(displayName);
}

export function roundWithMaxPrecision(n: number, precision = 1) {
	const precisionWithPow10 = 10 ** precision;
	return Math.round(n * precisionWithPow10) / precisionWithPow10;
}

export const generateUrl = (url: string, params: any) => {
	const myUrlWithParams = new URL(url);

	if (params) {
		Object.keys(params).forEach((value) => {
			myUrlWithParams.searchParams.append(value, params[value]);
		});
	}

	return myUrlWithParams.href;
};

export function camelCase(str: string) {
	return str
		.toLowerCase()
		.replace(/[^\w]+(.)/g, (ltr) => ltr.toUpperCase())
		.replace(/[^a-zA-Z]/g, '');
}

export function uniqueArray<T>(array: T[], identifier: string): T[] {
	return [...new Map(array.map((m: any) => [m[identifier], m])).values()];
}

export function capitalize(str: string) {
	return str.replace(/(\b[a-z](?!\s))/g, (x) => x.toUpperCase());
}

export function genreIdToName(genreId: number) {
	switch (genreId) {
		case 28:
			return 'Action';
		case 12:
			return 'Adventure';
		case 16:
			return 'Animation';
		case 35:
			return 'Comedy';
		case 80:
			return 'Crime';
		case 99:
			return 'Documentary';
		case 18:
			return 'Drama';
		case 10751:
			return 'Family';
		case 14:
			return 'Fantasy';
		case 36:
			return 'History';
		case 27:
			return 'Horror';
		case 10402:
			return 'Music';
		case 9648:
			return 'Mystery';
		case 10749:
			return 'Romance';
		case 878:
			return 'Science Fiction';
		case 10770:
			return 'TV Movie';
		case 53:
			return 'Thriller';
		case 10752:
			return 'War';
		case 37:
			return 'Western';
		default:
			return null;
	}
}
