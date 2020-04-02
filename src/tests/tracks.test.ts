import mongoose from 'mongoose';
import request from 'supertest';
import { Buffer } from 'safe-buffer';
import Keygrip from 'keygrip';

import { app } from '../server';

import {
	populateUsers,
	populateTags,
	populateTutorials,
	populateTracks,
	removeUsers,
	removeTags,
	removeTutorials,
	removeTracks
} from './mocks/seed';
import { users, tags, tutorials, tracks } from './mocks/data';

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
beforeEach(populateTracks);

afterEach(removeUsers);
afterEach(removeTags);
afterEach(removeTutorials);
afterEach(removeTracks);

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

	describe('GET /api/tracks', () => {
		describe('Valid request tests', () => {
			it('should get all tracks alphabetically sorted', done => {
				request(app)
					.get('/api/tracks')
					.expect(200)
					.expect(res => {
						expect(res.body.tracks.length).toBe(tracks.length);
						expect(res.body.tracks[0].name).toBe('Back-end Developer Roadmap');
						expect(res.body.tracks[1].name).toBe('Front-end Developer Roadmap');
						expect(res.body.tracks[2].name).toBe('Full stack Developer Roadmap');
					})
					.end(done);
			});
		});
	});

	describe('GET /api/tracks/track/:trackId', () => {
		describe('Valid request tests', () => {
			it('should return information of the track with given id', done => {
				request(app)
					.get(`/api/tracks/track/${tracks[0]._id}`)
					.expect(200)
					.expect(res => {
						expect(res.body.track.name).toBe(tracks[0].name);
						expect(res.body.track.description).toBe(tracks[0].description);
						expect(res.body.track.tutorials.length).toBe(tracks[0].tutorials.length);
						expect(res.body.track.submittedBy.userId).toBe(
							tracks[0].submittedBy.userId.toHexString()
						);
					})
					.end(done);
			});
		});
	});

	describe('GET /api/tracks/unapproved', () => {
		describe('Valid request tests', () => {
			it('should allow admin to get list of unapproved tracks', done => {
				request(app)
					.get('/api/tracks/unapproved')
					.set('Cookie', adminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tracks.length).toBe(tracks.length - 1);
						expect(res.body.tracks[0].isApproved).toBe(false);
						expect(res.body.tracks[1].isApproved).toBe(false);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get unapproved tracks', done => {
				request(app)
					.get('/api/tracks/unapproved')
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
					.get('/api/tracks/unapproved')
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('POST /api/tracks', () => {
		describe('Valid request tests', () => {
			it('should allow authenticated user to add new track', done => {
				const track = {
					name: 'New Track',
					description: 'New Track Description',
					tutorials: [tutorials[0]._id]
				};

				request(app)
					.post('/api/tracks')
					.set('Cookie', userCredentials)
					.send(track)
					.expect(201)
					.expect(res => {
						expect(res.body.track.name).toBe(track.name);
						expect(res.body.track.description).toBe(track.description);
						expect(res.body.track.tutorials.length).toBe(track.tutorials.length);
						expect(res.body.track.isApproved).toBe(false);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			const track = {
				name: 'New Track',
				description: 'New Track Description',
				tutorials: [tutorials[0]._id]
			};

			it('should not allow user to add exisiting track', done => {
				request(app)
					.post('/api/tracks')
					.set('Cookie', userCredentials)
					.send(tracks[0])
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Track already exist');
					})
					.end(done);
			});

			it('should not allow user to add track with empty name', done => {
				const newTrack = {
					...track,
					name: ''
				};

				request(app)
					.post('/api/tracks')
					.set('Cookie', userCredentials)
					.send(newTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Track name is required');
					})
					.end(done);
			});

			it('should not allow user to add track with empty dscription', done => {
				const newTrack = {
					...track,
					description: ''
				};

				request(app)
					.post('/api/tracks')
					.set('Cookie', userCredentials)
					.send(newTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Track description is required');
					})
					.end(done);
			});

			it('should not allow user to add track with no tutorials', done => {
				const newTrack = {
					...track,
					tutorials: []
				};

				request(app)
					.post('/api/tracks')
					.set('Cookie', userCredentials)
					.send(newTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('At least one tutorial is required');
					})
					.end(done);
			});

			it('should not allow user to add track with empty strings in tutorials', done => {
				const newTrack = {
					...track,
					tutorials: [tutorials[0]._id, '']
				};

				request(app)
					.post('/api/tracks')
					.set('Cookie', userCredentials)
					.send(newTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial Id cannot be empty');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to add a track', done => {
				request(app)
					.post('/api/tracks')
					.send(tracks[0])
					.expect(401)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});
	});

	describe('PUT /api/tracks/update/:trackId', () => {
		describe('Valid request tests', () => {
			it('should allow admin to update the track', done => {
				const updatedTrack = {
					name: 'Updated Track Name',
					description: 'Udpdated Track Description'
				};

				request(app)
					.put(`/api/tracks/update/${tracks[1]._id}`)
					.set('Cookie', adminCredentials)
					.send(updatedTrack)
					.expect(200)
					.expect(res => {
						expect(res.body.track.name).toBe(updatedTrack.name);
						expect(res.body.track.description).toBe(updatedTrack.description);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			const track = {
				name: 'New Track',
				description: 'New Track Description',
				tutorials: [tutorials[0]._id]
			};

			it('should not allow user to add track with empty name', done => {
				const updatedTrack = {
					...track,
					name: ''
				};

				request(app)
					.put(`/api/tracks/update/${tracks[1]._id}`)
					.set('Cookie', adminCredentials)
					.send(updatedTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Track name is required');
					})
					.end(done);
			});

			it('should not allow user to add track with empty dscription', done => {
				const updatedTrack = {
					...track,
					description: ''
				};

				request(app)
					.put(`/api/tracks/update/${tracks[1]._id}`)
					.set('Cookie', adminCredentials)
					.send(updatedTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Track description is required');
					})
					.end(done);
			});

			it('should not allow user to add track with no tutorials', done => {
				const updatedTrack = {
					...track,
					tutorials: []
				};

				request(app)
					.put(`/api/tracks/update/${tracks[1]._id}`)
					.set('Cookie', adminCredentials)
					.send(updatedTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('At least one tutorial is required');
					})
					.end(done);
			});

			it('should not allow user to add track with empty strings in tutorials', done => {
				const updatedTrack = {
					...track,
					tutorials: [tutorials[0]._id, '']
				};

				request(app)
					.put(`/api/tracks/update/${tracks[1]._id}`)
					.set('Cookie', adminCredentials)
					.send(updatedTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.error).toBe('Tutorial Id cannot be empty');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to update a track', done => {
				request(app)
					.put(`/api/tracks/update/${tracks[2]._id}`)
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
					.put(`/api/tracks/update/${tracks[2]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('PATCH /api/tracks/approved-status', () => {
		describe('Valid request tests', () => {
			it('should allow admin to change the approved status of the tutorial', done => {
				const track = {
					trackId: tracks[1]._id
				};

				request(app)
					.patch('/api/tracks/approved-status')
					.set('Cookie', adminCredentials)
					.send(track)
					.expect(200)
					.expect(res => {
						expect(res.body.track.isApproved).toBe(!tracks[1].isApproved);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to change the approved status of the track', done => {
				const track = {
					trackId: tracks[1]._id
				};

				request(app)
					.patch('/api/tracks/approved-status')
					.send(track)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to change the approved status of the track', done => {
				const track = {
					trackId: tracks[1]._id
				};

				request(app)
					.patch('/api/tracks/approved-status')
					.set('Cookie', userCredentials)
					.send(track)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/tracks/track/:trackId', () => {
		describe('Valid request tests', () => {
			it('should allow admin to delete the track', done => {
				request(app)
					.delete(`/api/tracks/track/${tracks[2]._id}`)
					.set('Cookie', adminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.track.name).toBe(tracks[2].name);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to delete the track', done => {
				request(app)
					.delete(`/api/tracks/track/${tracks[2]._id}`)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to delete the track', done => {
				request(app)
					.delete(`/api/tracks/track/${tracks[2]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Admin access required');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/tracks/cancel/:trackId', () => {
		describe('Valid request tests', () => {
			it('should allow the user to cancel request to add track', done => {
				request(app)
					.delete(`/api/tracks/cancel/${tracks[1]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.track._id).toBe(tracks[1]._id.toHexString());
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not allow user to delete an approved track', done => {
				request(app)
					.delete(`/api/tracks/cancel/${tracks[2]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe(
							'Track is approved and cannot be deleted. Contact Admin.'
						);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to cancel track request', done => {
				request(app)
					.delete(`/api/tracks/cancel/${tracks[1]._id}`)
					.expect(401)
					.expect(res => {
						expect(res.body.error).toBe('You must be logged in to perform the action');
					})
					.end(done);
			});
		});

		describe('Access validation tests', () => {
			it('should not allow authenticated user to cancel request of track by other user', done => {
				request(app)
					.delete(`/api/tracks/cancel/${tracks[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.error).toBe('Only track owner can cancel request');
					})
					.end(done);
			});
		});
	});
});
