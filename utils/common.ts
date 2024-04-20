export function numberShortHand(number: number): string {
	return Intl.NumberFormat('en-US', {
		maximumFractionDigits: 1,
		notation: 'compact',
	}).format(number);
}

export function formatRuntime(runtime: number): string {
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
