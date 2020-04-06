import mongoose from 'mongoose';
import request from 'supertest';
import { Buffer } from 'safe-buffer';
import Keygrip from 'keygrip';

import { app } from '../server';

import { populateUsers, populateTags, removeUsers, removeTags } from './mocks/seed';
import { users, tags } from './mocks/data';

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

afterEach(removeUsers);
afterEach(removeTags);

describe('Route /api/tags', () => {
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

	describe('GET /api/tags', () => {
		describe('Valid request tests', () => {
			it('should get all tags alphabetically sorted', done => {
				request(app)
					.get('/api/tags')
					.expect(200)
					.expect(res => {
						const sortedTags = [...tags].sort((tag1, tag2) =>
							tag1.name > tag2.name ? 1 : -1
						);

						expect(res.body.tags.length).toBe(tags.length);
						sortedTags.forEach((tag, index) => {
							expect(res.body.tags[index].name).toBe(tag.name);
						});
					})
					.end(done);
			});
		});
	});

	describe('GET /api/tags/unapproved', () => {
		describe('Valid request tests', () => {
			it('should allow admin to get the list of unapproved tags', done => {
				request(app)
					.get('/api/tags/unapproved')
					.set('Cookie', adminCredentials)
					.expect(200)
					.expect(res => {
						const unapprovedTags = tags.filter(tag => !tag.isApproved);

						expect(res.body.tags.length).toBe(unapprovedTags.length);
						res.body.tags.forEach((tag: any) => {
							expect(tag.isApproved).toBe(false);
							expect(tag.isApproved).toBe(false);
						});
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get the list of unapproved tags', done => {
				request(app)
					.get('/api/tags/unapproved')
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe(
							'You must be logged in to perform the action'
						);
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow user to get the list of unapproved tags', done => {
				request(app)
					.get('/api/tags/unapproved')
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('POST /api/tags', () => {
		describe('Valid request tests', () => {
			it('should allow authenticated user to add a new tag', done => {
				const tag = {
					name: 'C#'
				};

				request(app)
					.post('/api/tags')
					.set('Cookie', userCredentials)
					.send(tag)
					.expect(201)
					.expect(res => {
						expect(res.body.tag.name).toBe(tag.name);
						expect(res.body.tag.slug).toBe('c-sharp');
						expect(res.body.tag.isApproved).toBe(false);
						expect(res.body.tag.submittedBy).toBe(users[1]._id.toHexString());
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not allow user to add a existing tag', done => {
				const tag = {
					name: 'C++'
				};

				request(app)
					.post('/api/tags')
					.set('Cookie', userCredentials)
					.send(tag)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Tag already exist');
					})
					.end(done);
			});

			it('should not allow user to add a empty tag', done => {
				const tag = {
					name: ''
				};

				request(app)
					.post('/api/tags')
					.set('Cookie', userCredentials)
					.send(tag)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Tag name is required');
					})
					.end(done);
			});

			it('should not allow user to add a tag with more than 30 characters', done => {
				const tag = {
					name: 'A'.repeat(35)
				};

				request(app)
					.post('/api/tags')
					.set('Cookie', userCredentials)
					.send(tag)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe(
							'Tag should contain maximum 30 characters'
						);
					})
					.end(done);
			});

			it('should ignore extra properties', done => {
				const tag = {
					name: 'New Tag',
					isApproved: true
				};

				request(app)
					.post('/api/tags')
					.set('Cookie', userCredentials)
					.send(tag)
					.expect(201)
					.expect(res => {
						expect(res.body.tag.name).toBe(tag.name);
						expect(res.body.tag.slug).toBe('new-tag');
						expect(res.body.tag.isApproved).toBe(false);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to add a tag', done => {
				const tag = {
					name: 'Test'
				};

				request(app)
					.post('/api/tags')
					.send(tag)
					.expect(401)
					.expect(res => {
						expect(res.body.errorMessage).toBe(
							'You must be logged in to perform the action'
						);
					})
					.end(done);
			});
		});
	});

	describe('PUT /api/tags/update', () => {
		describe('Valid request tests', () => {
			it('should allow admin to update a tag', done => {
				const tag = {
					tagId: tags[0]._id,
					name: 'React'
				};

				request(app)
					.put('/api/tags/update')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(200)
					.expect(res => {
						expect(res.body.tag.name).toBe(tag.name);
						expect(res.body.tag.slug).toBe('react');
						expect(res.body.tag.isApproved).toBe(tags[0].isApproved);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not allow to update a tag as empty', done => {
				const tag = {
					tagId: tags[0]._id,
					name: ''
				};

				request(app)
					.put('/api/tags/update')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Tag name is required');
					})
					.end(done);
			});

			it('should not allow to update a tag of more than 30 characters', done => {
				const tag = {
					tagId: tags[0]._id,
					name: 'A'.repeat(35)
				};

				request(app)
					.put('/api/tags/update')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe(
							'Tag should contain maximum 30 characters'
						);
					})
					.end(done);
			});

			it('should ignore extra properties', done => {
				const tag = {
					tagId: tags[0]._id,
					name: 'New Tag',
					isApproved: true
				};

				request(app)
					.put('/api/tags/update')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(200)
					.expect(res => {
						expect(res.body.tag.name).toBe(tag.name);
						expect(res.body.tag.slug).toBe('new-tag');
						expect(res.body.tag.isApproved).toBe(tags[0].isApproved);
					})
					.end(done);
			});

			it('should throw an error for invalid mongo id', done => {
				const tag = {
					tagId: '123',
					name: 'New Tag',
					isApproved: true
				};

				request(app)
					.put('/api/tags/update')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Tag Id');
					})
					.end(done);
			});

			it('should throw an error if tag is not found', done => {
				const tag = {
					tagId: new mongoose.Types.ObjectId(),
					name: 'New Tag',
					isApproved: true
				};

				request(app)
					.put('/api/tags/update')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Tag not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to update a tag', done => {
				const tag = {
					tagId: tags[0]._id,
					name: 'React'
				};

				request(app)
					.put('/api/tags/update')
					.send(tag)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe(
							'You must be logged in to perform the action'
						);
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to update a tag', done => {
				const tag = {
					tagId: tags[0]._id,
					name: 'React'
				};

				request(app)
					.put('/api/tags/update')
					.set('Cookie', userCredentials)
					.send(tag)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('PATCH /api/tags/approved-status', () => {
		describe('Valid request tests', () => {
			it('should allow admin to update the approved status of a tag', done => {
				const tag = {
					tagId: tags[0]._id
				};

				request(app)
					.patch('/api/tags/approved-status')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(200)
					.expect(res => {
						expect(res.body.tag.isApproved).toBe(!tags[0].isApproved);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				const tag = {
					tagId: '123'
				};

				request(app)
					.patch('/api/tags/approved-status')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Tag Id');
					})
					.end(done);
			});

			it('should throw an error if tag is not found', done => {
				const tag = {
					tagId: new mongoose.Types.ObjectId()
				};

				request(app)
					.patch('/api/tags/approved-status')
					.set('Cookie', adminCredentials)
					.send(tag)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Tag not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to update the approved status of a tag', done => {
				const tag = {
					tagId: tags[0]._id
				};

				request(app)
					.patch('/api/tags/approved-status')
					.send(tag)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe(
							'You must be logged in to perform the action'
						);
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to update the approved status of a tag', done => {
				const tag = {
					tagId: tags[0]._id
				};

				request(app)
					.patch('/api/tags/approved-status')
					.set('Cookie', userCredentials)
					.send(tag)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/tags/:tagId', () => {
		describe('Valid request tests', () => {
			it('should allow admin to delete a tag', done => {
				request(app)
					.delete(`/api/tags/${tags[0]._id}`)
					.set('Cookie', adminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tag.name).toBe(tags[0].name);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.delete('/api/tags/123')
					.set('Cookie', adminCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Tag Id');
					})
					.end(done);
			});

			it('should throw an error if tag is not found', done => {
				request(app)
					.delete(`/api/tags/${new mongoose.Types.ObjectId()}`)
					.set('Cookie', adminCredentials)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Tag not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to delete a tag', done => {
				request(app)
					.delete(`/api/tags/${tags[0]._id}`)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe(
							'You must be logged in to perform the action'
						);
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to delete a tag', done => {
				request(app)
					.delete(`/api/tags/${tags[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});
});
