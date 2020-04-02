import mongoose from 'mongoose';
import request from 'supertest';
import { Buffer } from 'safe-buffer';
import Keygrip from 'keygrip';

import { app } from '../server';

import {
	populateUsers,
	populateTags,
	populateTutorials,
	removeUsers,
	removeTags,
	removeTutorials
} from './mocks/seed';
import { users, tags, tutorials } from './mocks/data';

const { COOKIE_KEY = '' } = process.env;

beforeAll(async () => {
	const { MONGO_URI = '' } = process.env;
	await mongoose.connect(MONGO_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	});
});

afterAll(async () => {
	await mongoose.connection.close();
});

beforeEach(populateUsers);
beforeEach(populateTags);
beforeEach(populateTutorials);

afterEach(removeUsers);
afterEach(removeTags);
afterEach(removeTutorials);

describe('Route /api/tutorials', () => {
	let userCredentials: string[];
	let adminCredentials: string[];

	beforeAll(() => {
		// User with admin access
		const userId = users[0]._id;
		// Object made by passport to make a session
		const sessionObject = {
			passport: {
				user: userId
			}
		};
		// Session object converted to JSON string to attach to a session
		const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
		// Creating new keygrip to sign the session
		const keygrip = new Keygrip([COOKIE_KEY]);
		// Signing the session
		// Note: The cookie in passport have the `express:sess=` and `express:sess.sig` string
		// prepended to the session and session signature itself
		const sig = keygrip.sign(`express:sess=${sessionString}`);

		adminCredentials = [`express:sess=${sessionString}`, `express:sess.sig=${sig}`];
	});

	beforeAll(() => {
		// User without admin access
		const userId = users[1]._id;
		const sessionObject = {
			passport: {
				user: userId
			}
		};
		const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
		const keygrip = new Keygrip([COOKIE_KEY]);
		const sig = keygrip.sign(`express:sess=${sessionString}`);

		userCredentials = [`express:sess=${sessionString}`, `express:sess.sig=${sig}`];
	});

	describe('GET /api/tutorials', () => {
		describe('Valid request tests', () => {
			it('should get all tags alphabetically sorted', done => {
				request(app)
					.get('/api/tutorials')
					.expect(200)
					.expect(res => {
						expect(res.body.tutorials.length).toBe(tutorials.length);
						expect(res.body.tutorials[0].title).toBe(
							'Advanced React and Redux: 2018 Edition'
						);
						expect(res.body.tutorials[1].title).toBe(
							'Four Ways To Style React Components'
						);
						expect(res.body.tutorials[2].title).toBe('Modern React with Redux');
					})
					.end(done);
			});
		});
	});

	describe('GET /api/tutorials/tutorial/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should get the information of the given tutorial id', done => {
				request(app)
					.get(`/api/tutorials/tutorial/${tutorials[0]._id}`)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial.title).toBe(tutorials[0].title);
						expect(res.body.tutorial.link).toBe(tutorials[0].link);
						expect(res.body.tutorial.tags.length).toBe(tutorials[0].tags.length);
						expect(res.body.tutorial.educator).toBe(tutorials[0].educator);
						expect(res.body.tutorial.typeOfTutorial).toBe(tutorials[0].typeOfTutorial);
						expect(res.body.tutorial.skillLevel).toBe(tutorials[0].skillLevel);
						expect(res.body.tutorial.upvotes.length).toBe(tutorials[0].upvotes.length);
						expect(res.body.tutorial.submittedBy.userId).toBe(
							tutorials[0].submittedBy.userId.toHexString()
						);
						expect(res.body.tutorial.comments.length).toBe(
							tutorials[0].comments.length
						);
						expect(res.body.tutorial.isApproved).toBe(tutorials[0].isApproved);
					})
					.end(done);
			});
		});
	});

	describe('GET /api/tutorials/tag/:tagId', () => {
		describe('Valid request tests', () => {
			it('should get list of tutorials with the given tag', done => {
				request(app)
					.get(`/api/tutorials/tag/${tags[0]._id}`)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorials.length).toBe(tutorials.length - 1);
						expect(res.body.tutorials[0].title).toBe(
							'Advanced React and Redux: 2018 Edition'
						);
						expect(res.body.tutorials[1].title).toBe('Modern React with Redux');
					})
					.end(done);
			});
		});
	});

	describe('GET /api/tutorials/unapproved', () => {
		describe('Valid request tests', () => {
			it('should allow admin get list of unapproved tutorials', done => {
				request(app)
					.get('/api/tutorials/unapproved')
					.set('Cookie', adminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorials.length).toBe(tutorials.length - 1);
						expect(res.body.tutorials[0].isApproved).toBe(false);
						expect(res.body.tutorials[1].isApproved).toBe(false);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get unapproved tutorials', done => {
				request(app)
					.get('/api/tutorials/unapproved')
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to get unapproved tutorials', done => {
				request(app)
					.get('/api/tutorials/unapproved')
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('POST /api/tutorials', () => {
		describe('Valid request tests', () => {
			it('should allow authenticated user to add a tutorial', done => {
				const tutorial = {
					title: 'The Complete Node.js Developer Course',
					link: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/',
					tags: [tags[0]._id],
					educator: 'Andrew Mead',
					medium: 'Video',
					typeOfTutorial: 'Paid',
					skillLevel: 'Beginner'
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(tutorial)
					.expect(201)
					.expect(res => {
						expect(res.body.tutorial.title).toBe(tutorial.title);
						expect(tutorial.link).toContain(res.body.tutorial.link);
						expect(res.body.tutorial.tags.length).toBe(tutorial.tags.length);
						expect(res.body.tutorial.educator).toBe(tutorial.educator);
						expect(res.body.tutorial.medium).toBe(tutorial.medium);
						expect(res.body.tutorial.typeOfTutorial).toBe(tutorial.typeOfTutorial);
						expect(res.body.tutorial.skillLevel).toBe(tutorial.skillLevel);
						expect(res.body.tutorial.submittedBy.userId).toBe(
							users[1]._id.toHexString()
						);
						expect(res.body.tutorial.isApproved).toBe(false);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			const tutorial = {
				title: 'The Complete Node.js Developer Course',
				link: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2',
				tags: [tags[0]._id],
				educator: 'Andrew Mead',
				medium: 'Video',
				typeOfTutorial: 'Paid',
				skillLevel: 'Beginner'
			};

			it('should not allow user to add exisiting tutorial', done => {
				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(tutorials[0])
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial already exist');
					})
					.end(done);
			});

			it('should not allow user to add tutorial with empty title', done => {
				const newTutorial = {
					...tutorial,
					title: ''
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial title is required');
					})
					.end(done);
			});

			it('should not allow user to add tutorial with empty link', done => {
				const newTutorial = {
					...tutorial,
					link: ''
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial link is required');
					})
					.end(done);
			});

			it('should not allow user to add tutorial with invalid link', done => {
				const newTutorial = {
					...tutorial,
					link: 'testlink'
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Invalid tutorial link');
					})
					.end(done);
			});

			it('should not allow user to add tutorial with no tags', done => {
				const newTutorial = {
					...tutorial,
					tags: []
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('At least one tag is required');
					})
					.end(done);
			});

			it('should not allow user to add tutorial with more than 5 tags', done => {
				const newTutorial = {
					...tutorial,
					tags: [
						tags[0]._id,
						tags[0]._id,
						tags[0]._id,
						tags[0]._id,
						tags[0]._id,
						tags[0]._id
					]
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('A tutorial can contain maximum of 5 tags');
					})
					.end(done);
			});

			it('should not allow user to add tutorial with empty strings in tags', done => {
				const newTutorial = {
					...tutorial,
					tags: [tags[0]._id, '']
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial tag cannot be empty');
					})
					.end(done);
			});

			it('should not allow user to add tutorial with no educator', done => {
				const newTutorial = {
					...tutorial,
					educator: ''
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Educator name is required');
					})
					.end(done);
			});

			it('should not allow user to add tutorial with unaccepted medium', done => {
				const newTutorial = {
					...tutorial,
					medium: ''
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe(
							'Tutorial medium should be one of "Video" or "Blog"'
						);
					})
					.end(done);
			});

			it('should not allow user to add tutorial with unaccepted type', done => {
				const newTutorial = {
					...tutorial,
					typeOfTutorial: ''
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe(
							'Tutorial type should be one of "Free" or "Paid"'
						);
					})
					.end(done);
			});

			it('should not allow user to add tutorial with unaccepted skill level', done => {
				const newTutorial = {
					...tutorial,
					skillLevel: ''
				};

				request(app)
					.post('/api/tutorials')
					.set('Cookie', userCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe(
							'Tutorial skill level should be one of "Beginner", "Intermediate" or "Advanced"'
						);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to add a tutorial', done => {
				request(app)
					.post('/api/tutorials')
					.send(tutorials[0])
					.expect(401)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});
	});

	describe('POST /api/tutorials/upvote/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should allow user to add upvote to the tutorial', done => {
				request(app)
					.post(`/api/tutorials/upvote/${tutorials[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial).toBe(tutorials[0]._id.toHexString());
						expect(res.body.upvotes.length).toBe(tutorials[0].upvotes.length + 1);
						expect(res.body.upvotes).toContain(users[1]._id.toHexString());
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not add upvote if user had already upvoted', done => {
				request(app)
					.post(`/api/tutorials/upvote/${tutorials[1]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial).toBe(tutorials[1]._id.toHexString());
						expect(res.body.upvotes.length).toBe(tutorials[1].upvotes.length);
						expect(res.body.upvotes).toContain(users[1]._id.toHexString());
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to add an upvote', done => {
				request(app)
					.post(`/api/tutorials/upvote/${tutorials[1]._id}`)
					.expect(401)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});
	});

	describe('POST /api/tutorials/comment/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should allow user to add comment', done => {
				const comment = {
					comment: 'comment'
				};

				request(app)
					.post(`/api/tutorials/comment/${tutorials[1]._id}`)
					.set('Cookie', userCredentials)
					.send(comment)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial).toBe(tutorials[1]._id.toHexString());
						expect(res.body.comments.length).toBe(tutorials[1].comments.length + 1);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not allow user to add empty comment', done => {
				const comment = {
					comment: ''
				};

				request(app)
					.post(`/api/tutorials/comment/${tutorials[1]._id}`)
					.set('Cookie', userCredentials)
					.send(comment)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Comment is required');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to add an upvote', done => {
				request(app)
					.post(`/api/tutorials/comment/${tutorials[1]._id}`)
					.expect(401)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});
	});

	describe('PUT /api/tutorials/update/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should allow admin to update the tutorial', done => {
				const tutorial = {
					title: 'The Complete Node.js Developer Course',
					educator: 'Andrew Mead',
					skillLevel: 'Beginner'
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(tutorial)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial.title).toBe(tutorial.title);
						expect(res.body.tutorial.educator).toBe(tutorial.educator);
						expect(res.body.tutorial.skillLevel).toBe(tutorial.skillLevel);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			const tutorial = {
				title: 'The Complete Node.js Developer Course',
				link: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2',
				tags: [tags[0]._id],
				educator: 'Andrew Mead',
				medium: 'Video',
				typeOfTutorial: 'Paid',
				skillLevel: 'Beginner'
			};

			it('should not allow admin to update tutorial with empty title', done => {
				const newTutorial = {
					...tutorial,
					title: ''
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial title is required');
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with empty link', done => {
				const newTutorial = {
					...tutorial,
					link: ''
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial link is required');
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with invalid link', done => {
				const newTutorial = {
					...tutorial,
					link: 'testlink'
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Invalid tutorial link');
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with empty tags', done => {
				const newTutorial = {
					...tutorial,
					tags: []
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('At least one tag is required');
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with more than 5 tags', done => {
				const newTutorial = {
					...tutorial,
					tags: [
						tags[0]._id,
						tags[0]._id,
						tags[0]._id,
						tags[0]._id,
						tags[0]._id,
						tags[0]._id
					]
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('A tutorial can contain maximum of 5 tags');
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with empty strings in tags', done => {
				const newTutorial = {
					...tutorial,
					tags: [tags[0]._id, '']
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial tag cannot be empty');
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with no educator', done => {
				const newTutorial = {
					...tutorial,
					educator: ''
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Educator name is required');
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with unaccepted medium', done => {
				const newTutorial = {
					...tutorial,
					medium: ''
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe(
							'Tutorial medium should be one of "Video" or "Blog"'
						);
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with unaccepted type', done => {
				const newTutorial = {
					...tutorial,
					typeOfTutorial: ''
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe(
							'Tutorial type should be one of "Free" or "Paid"'
						);
					})
					.end(done);
			});

			it('should not allow admin to update tutorial with unaccepted skill level', done => {
				const newTutorial = {
					...tutorial,
					skillLevel: ''
				};

				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.send(newTutorial)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe(
							'Tutorial skill level should be one of "Beginner", "Intermediate" or "Advanced"'
						);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to update a tutorial', done => {
				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to update a tutorial', done => {
				request(app)
					.put(`/api/tutorials/update/${tutorials[2]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('PATCH /api/tutorials/approved-status', () => {
		describe('Valid request tests', () => {
			it('should allow admin to change the approved status of the tutorial', done => {
				const tutorial = {
					tutorialId: tutorials[1]._id
				};

				request(app)
					.patch('/api/tutorials/approved-status')
					.set('Cookie', adminCredentials)
					.send(tutorial)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial.isApproved).toBe(!tutorials[1].isApproved);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to change the approved status of the tutorial', done => {
				const tutorial = {
					tutorialId: tutorials[1]._id
				};

				request(app)
					.patch('/api/tutorials/approved-status')
					.send(tutorial)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to change the approved status of the tutorial', done => {
				const tutorial = {
					tutorialId: tutorials[1]._id
				};

				request(app)
					.patch('/api/tutorials/approved-status')
					.set('Cookie', userCredentials)
					.send(tutorial)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/tutorials/tutorial/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should allow admin to delete the tutorial', done => {
				request(app)
					.delete(`/api/tutorials/tutorial/${tutorials[2]._id}`)
					.set('Cookie', adminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial.title).toBe(tutorials[2].title);
						expect(tutorials[2].title).toContain(res.body.tutorial.title);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to delete the tutorial', done => {
				request(app)
					.delete(`/api/tutorials/tutorial/${tutorials[2]._id}`)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to delete the tutorial', done => {
				request(app)
					.delete(`/api/tutorials/tutorial/${tutorials[2]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/tutorials/upvote/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should allow user to remove upvote', done => {
				request(app)
					.delete(`/api/tutorials/upvote/${tutorials[1]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial).toBe(tutorials[1]._id.toHexString());
						expect(res.body.upvotes.length).toBe(tutorials[1].upvotes.length - 1);
						expect(res.body.upvotes).not.toContain(users[1]._id.toHexString());
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to remove upvote', done => {
				request(app)
					.delete(`/api/tutorials/upvote/${tutorials[1]._id}`)
					.expect(401)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/tutorials/comment/:tutorialId/:commentId', () => {
		describe('Valid request tests', () => {
			it('should allow user to delete the comment', done => {
				request(app)
					.delete(
						`/api/tutorials/comment/${tutorials[0]._id}/${tutorials[0].comments[1]._id}`
					)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial).toBe(tutorials[0]._id.toHexString());
						expect(res.body.comments.length).toBe(tutorials[0].comments.length - 1);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to delete a comment', done => {
				request(app)
					.delete(
						`/api/tutorials/comment/${tutorials[0]._id}/${tutorials[0].comments[0]._id}`
					)
					.expect(401)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow user to delete other comment by other user', done => {
				request(app)
					.delete(
						`/api/tutorials/comment/${tutorials[0]._id}/${tutorials[0].comments[0]._id}`
					)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Only comments by you can be deleted');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/tutorials/cancel/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should allow the user to cancel request to add tutorial', done => {
				request(app)
					.delete(`/api/tutorials/cancel/${tutorials[2]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorial._id).toBe(tutorials[2]._id.toHexString());
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not allow user to delete an approved tutorial', done => {
				request(app)
					.delete(`/api/tutorials/cancel/${tutorials[1]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe(
							'Tutorial is approved and cannot be deleted. Contact Admin.'
						);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to cancel tutorial request', done => {
				request(app)
					.delete(`/api/tutorials/cancel/${tutorials[1]._id}`)
					.expect(401)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to cancel request of tutorial by other user', done => {
				request(app)
					.delete(`/api/tutorials/cancel/${tutorials[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Only tutorial owner can cancel request');
					})
					.end(done);
			});
		});
	});
});
