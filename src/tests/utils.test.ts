import { slugifyTag, slugifyTutorial, slugifyTrack } from '../utils/utils';
import { stringsToSlugify } from './mocks/data';

describe('Utils Tests', () => {
	const { tags, tutorials, tracks } = stringsToSlugify;

	describe('Slugify Tags', () => {
		it('should slugify tags properly', () => {
			tags.forEach(tag => {
				const slug = slugifyTag(tag.tag);
				expect(slug).toBe(tag.slug);
			});
		});
	});

	describe('Slugify Tutorials', () => {
		it('should slugify tutorials properly', () => {
			tutorials.forEach(tutorial => {
				const slug = slugifyTutorial(tutorial.tutorial);
				expect(slug).toContain(tutorial.slug);
			});
		});
	});

	describe('Slugify Tracks', () => {
		it('should slugify tracks properly', () => {
			tracks.forEach(track => {
				const slug = slugifyTrack(track.track);
				expect(slug).toBe(track.slug);
			});
		});
	});
});
