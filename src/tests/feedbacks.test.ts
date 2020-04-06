import mongoose from 'mongoose';
import request from 'supertest';
import { Buffer } from 'safe-buffer';
import Keygrip from 'keygrip';

import { app } from '../server';

import { populateUsers, populateFeedbacks, removeUsers, removeFeedbacks } from './mocks/seed';
import { users, feedbacks } from './mocks/data';

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
beforeEach(populateFeedbacks);

afterEach(removeUsers);
afterEach(removeFeedbacks);

describe('Route /api/feedbacks', () => {
	let userCredentials: string[];
	let adminCredentials: string[];
	let superAdminCredentials: string[];

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

	beforeAll(() => {
		// User with super admin access
		const userId = users[2]._id;
		const sessionObject = {
			passport: {
				user: userId
			}
		};
		const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
		const keygrip = new Keygrip([COOKIE_KEY]);
		const sig = keygrip.sign(`express:sess=${sessionString}`);

		superAdminCredentials = [`express:sess=${sessionString}`, `express:sess.sig=${sig}`];
	});

	describe('GET /api/feedbacks', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to get all feedbacks', done => {
				request(app)
					.get('/api/feedbacks')
					.set('Cookie', superAdminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.feedbacks.length).toBe(feedbacks.length);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get feedbacks', done => {
				request(app)
					.get('/api/feedbacks')
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
			it('should not allow authenticated user to get feedbacks', done => {
				request(app)
					.get('/api/feedbacks')
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to get feedbacks', done => {
				request(app)
					.get('/api/feedbacks')
					.set('Cookie', adminCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});

	describe('GET /api/feedbacks/:feedbackId', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to get specific feedback', done => {
				request(app)
					.get(`/api/feedbacks/${feedbacks[0]._id}`)
					.set('Cookie', superAdminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.feedback.title).toBe(feedbacks[0].title);
						expect(res.body.feedback.message).toBe(feedbacks[0].message);
						expect(res.body.feedback.isRead).toBe(feedbacks[0].isRead);
						expect(res.body.feedback._id).toBe(feedbacks[0]._id.toHexString());
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.get('/api/feedbacks/123')
					.set('Cookie', superAdminCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Feedback Id');
					})
					.end(done);
			});

			it('should throw an error if feedback is not found', done => {
				request(app)
					.get(`/api/feedbacks/${new mongoose.Types.ObjectId()}`)
					.set('Cookie', superAdminCredentials)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Feedback not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get specific feedback', done => {
				request(app)
					.get(`/api/feedbacks/${feedbacks[0]._id}`)
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
			it('should not allow authenticated user to get feedback', done => {
				request(app)
					.get(`/api/feedbacks/${feedbacks[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to get feedback', done => {
				request(app)
					.get(`/api/feedbacks/${feedbacks[0]._id}`)
					.set('Cookie', adminCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});

	describe('POST /api/feedbacks', () => {
		describe('Valid request tests', () => {
			it('should allow autheticated user to post feedback', done => {
				const feedback = {
					title: 'Feedback Three Title',
					message: 'Feedback Three Message'
				};

				request(app)
					.post('/api/feedbacks')
					.set('Cookie', userCredentials)
					.send(feedback)
					.expect(201)
					.expect(res => {
						expect(res.body.feedback.title).toBe(feedback.title);
						expect(res.body.feedback.message).toBe(feedback.message);
						expect(res.body.feedback.isRead).toBe(false);
						expect(res.body.feedback.submittedBy.name).toBe(users[1].name);
						expect(res.body.feedback.submittedBy.userId).toBe(
							users[1]._id.toHexString()
						);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not allow user to send feedback with empty title', done => {
				const feedback = {
					title: '',
					message: 'Feedback Three Message'
				};

				request(app)
					.post('/api/feedbacks')
					.set('Cookie', userCredentials)
					.send(feedback)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Feedback title is required');
					})
					.end(done);
			});

			it('should not allow user to send feedback with empty message', done => {
				const feedback = {
					title: 'Feedback Three Title',
					message: ''
				};

				request(app)
					.post('/api/feedbacks')
					.set('Cookie', userCredentials)
					.send(feedback)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Feedback message is required');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to send feedback', done => {
				const feedback = {
					title: 'Feedback Three Title',
					message: 'Feedback Three Message'
				};

				request(app)
					.post('/api/feedbacks')
					.send(feedback)
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

	describe('PATCH /api/feedbacks/read', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to mark all feedbacks as read', done => {
				request(app)
					.patch('/api/feedbacks/read')
					.set('Cookie', superAdminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.feedbacks.length).toBe(feedbacks.length);
						res.body.feedbacks.forEach((feedback: any) => {
							expect(feedback.isRead).toBe(true);
						});
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated to mark all feedbacks as read', done => {
				request(app)
					.patch('/api/feedbacks/read')
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
			it('should not allow authenticated user to mark all feedbacks as read', done => {
				request(app)
					.patch('/api/feedbacks/read')
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to mark all feedbacks as read', done => {
				request(app)
					.patch('/api/feedbacks/read')
					.set('Cookie', adminCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});

	describe('PATCH /api/feedbacks/read/:feedbackId', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to mark a feedback as read', done => {
				request(app)
					.patch(`/api/feedbacks/read/${feedbacks[0]._id}`)
					.set('Cookie', superAdminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.feedback.isRead).toBe(true);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.patch('/api/feedbacks/read/123')
					.set('Cookie', superAdminCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Feedback Id');
					})
					.end(done);
			});

			it('should throw an error if feedback is not found', done => {
				request(app)
					.patch(`/api/feedbacks/read/${new mongoose.Types.ObjectId()}`)
					.set('Cookie', superAdminCredentials)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Feedback not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated to mark a feedback as read', done => {
				request(app)
					.patch(`/api/feedbacks/read/${feedbacks[0]._id}`)
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
			it('should not allow authenticated user to mark a feedback as read', done => {
				request(app)
					.patch(`/api/feedbacks/read/${feedbacks[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to mark a feedback as read', done => {
				request(app)
					.patch(`/api/feedbacks/read/${feedbacks[0]._id}`)
					.set('Cookie', adminCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});

	describe('PATCH /api/feedbacks/unread/:feedbackId', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to mark a feedback as unread', done => {
				request(app)
					.patch(`/api/feedbacks/unread/${feedbacks[1]._id}`)
					.set('Cookie', superAdminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.feedback.isRead).toBe(false);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.patch('/api/feedbacks/unread/123')
					.set('Cookie', superAdminCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Feedback Id');
					})
					.end(done);
			});

			it('should throw an error if feedback is not found', done => {
				request(app)
					.patch(`/api/feedbacks/unread/${new mongoose.Types.ObjectId()}`)
					.set('Cookie', superAdminCredentials)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Feedback not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated to mark a feedback as unread', done => {
				request(app)
					.patch(`/api/feedbacks/unread/${feedbacks[1]._id}`)
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
			it('should not allow authenticated user to mark a feedback as unread', done => {
				request(app)
					.patch(`/api/feedbacks/unread/${feedbacks[1]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to mark a feedback as unread', done => {
				request(app)
					.patch(`/api/feedbacks/unread/${feedbacks[1]._id}`)
					.set('Cookie', adminCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/feedbacks/:feedbackId', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to delete feedback', done => {
				request(app)
					.delete(`/api/feedbacks/${feedbacks[1]._id}`)
					.set('Cookie', superAdminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.feedback._id).toBe(feedbacks[1]._id.toHexString());
						expect(res.body.feedback.title).toBe(feedbacks[1].title);
						expect(res.body.feedback.message).toBe(feedbacks[1].message);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.delete('/api/feedbacks/123')
					.set('Cookie', superAdminCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Feedback Id');
					})
					.end(done);
			});

			it('should throw an error if feedback is not found', done => {
				request(app)
					.delete(`/api/feedbacks/${new mongoose.Types.ObjectId()}`)
					.set('Cookie', superAdminCredentials)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Feedback not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to delete feedback', done => {
				request(app)
					.delete(`/api/feedbacks/${feedbacks[1]._id}`)
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
			it('should not allow authenticated user to delete feedback', done => {
				request(app)
					.delete(`/api/feedbacks/${feedbacks[1]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to delete feedback', done => {
				request(app)
					.delete(`/api/feedbacks/${feedbacks[1]._id}`)
					.set('Cookie', adminCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});
});
