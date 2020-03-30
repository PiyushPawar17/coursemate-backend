import shortid from 'shortid';

export const slugifyTag = (str: string): string =>
	str
		.replace(/ +/g, '-')
		.replace(/_/g, '-')
		.replace(/\//g, '-')
		.replace(/#/g, '-sharp')
		.replace(/\+/g, '-plus')
		.replace(/^\./g, 'dot-')
		.replace(/\./g, '-dot-')
		.replace(/[^\w-]/g, '');

export const slugifyTutorial = (str: string): string =>
	str
		.replace(/-/g, '')
		.replace(/ +/g, '-')
		.replace(/_/g, '-')
		.replace(/\//g, '-')
		.replace(/#/g, '-sharp')
		.replace(/\+/g, '-plus')
		.replace(/\./g, '')
		.replace(/[^\w-]/g, '')
		.concat('-')
		.concat(shortid.generate());

export const slugifyTrack = (str: string): string =>
	str
		.replace(/-/g, '')
		.replace(/ +/g, '-')
		.replace(/_/g, '-')
		.replace(/\//g, '-')
		.replace(/#/g, '-sharp')
		.replace(/\+/g, '-plus')
		.replace(/\./g, '')
		.replace(/[^\w-]/g, '');
