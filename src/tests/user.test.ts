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
import { users, tutorials, tracks } from './mocks/data';

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

describe('Route /api/user', () => {
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

	describe('GET /api/user/submitted-tutorials', () => {
		describe('Valid request tests', () => {
			it('should allow authenticated user to get submitted tutorial', done => {
				request(app)
					.get('/api/user/submitted-tutorials')
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tutorials.length).toBe(users[1].submittedTutorials.length);
						res.body.tutorials.forEach((tutorial: any, index: number) => {
							expect(tutorial._id).toBe(
								users[1].submittedTutorials[index].toHexString()
							);
						});
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get submitted tutorials', done => {
				request(app)
					.get('/api/user/submitted-tutorials')
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

	describe('GET /api/user/favorites', () => {
		describe('Valid request tests', () => {
			it('should allow authenticated user to get favorites', done => {
				request(app)
					.get('/api/user/favorites')
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.favorites.length).toBe(users[1].favorites.length);
						res.body.favorites.forEach((favorite: any, index: number) => {
							expect(favorite._id).toBe(users[1].favorites[index].toHexString());
						});
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get favorites', done => {
				request(app)
					.get('/api/user/favorites')
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

	describe('GET /api/user/notifications', () => {
		describe('Valid request tests', () => {
			it('should allow authenticated user to get notifications', done => {
				request(app)
					.get('/api/user/notifications')
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.notifications.length).toBe(users[1].notifications.length);
						res.body.notifications.forEach((notification: any, index: number) => {
							expect(notification._id).toBe(
								users[1].notifications[index]._id.toHexString()
							);
						});
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get notifications', done => {
				request(app)
					.get('/api/user/notifications')
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

	describe('GET /api/user/tracks', () => {
		describe('Valid request tests', () => {
			it('should allow authenticated user to get tracks', done => {
				request(app)
					.get('/api/user/tracks')
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tracks.length).toBe(users[1].tracks.length);
						res.body.tracks.forEach((track: any, index: number) => {
							expect(track._id).toBe(users[1].tracks[index]._id.toHexString());
						});
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get tracks', done => {
				request(app)
					.get('/api/user/tracks')
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

	describe('GET /api/user/all-users', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to get all users', done => {
				request(app)
					.get('/api/user/all-users')
					.set('Cookie', superAdminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.users.length).toBe(users.length);
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to get users', done => {
				request(app)
					.get('/api/user/all-users')
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
			it('should not allow authenticated user to get users', done => {
				request(app)
					.get('/api/user/all-users')
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to get users', done => {
				request(app)
					.get('/api/user/all-users')
					.set('Cookie', adminCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});

	describe('POST /api/user/favorites/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should allow user to add to favorites', done => {
				request(app)
					.post(`/api/user/favorites/${tutorials[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.favorites.length).toBe(users[1].favorites.length + 1);
						expect(res.body.favorites[res.body.favorites.length - 1]._id).toBe(
							tutorials[0]._id.toHexString()
						);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not add tutorial to favorite if already exist', done => {
				request(app)
					.post(`/api/user/favorites/${tutorials[2]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.favorites.length).toBe(users[1].favorites.length);
					})
					.end(done);
			});

			it('should throw an error for invalid mongo id', done => {
				request(app)
					.post('/api/user/favorites/123')
					.set('Cookie', userCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Tutorial Id');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to add to favorites', done => {
				request(app)
					.post(`/api/user/favorites/${tutorials[2]._id}`)
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

	describe('POST /api/user/tracks/:trackId', () => {
		describe('Valid request tests', () => {
			it('should allow user to subscribe to a track', done => {
				request(app)
					.post(`/api/user/tracks/${tracks[1]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tracks.length).toBe(users[1].tracks.length + 1);
						expect(res.body.tracks[res.body.tracks.length - 1].track._id).toBe(
							tracks[1]._id.toHexString()
						);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not subscribe to track if already subscribed', done => {
				request(app)
					.post(`/api/user/tracks/${tracks[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.tracks.length).toBe(users[1].tracks.length);
					})
					.end(done);
			});

			it('should throw an error for invalid mongo id', done => {
				request(app)
					.post('/api/user/tracks/123')
					.set('Cookie', userCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Track Id');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to subscribe to track', done => {
				request(app)
					.post(`/api/user/tracks/${tracks[2]._id}`)
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

	describe('PUT /api/user/update', () => {
		describe('Valid request tests', () => {
			it('should allow user to update name', done => {
				const updatedUser = {
					name: 'New Name'
				};

				request(app)
					.put('/api/user/update')
					.set('Cookie', userCredentials)
					.send(updatedUser)
					.expect(200)
					.expect(res => {
						expect(res.body.user.name).toBe(updatedUser.name);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not allow user to update empty name', done => {
				const updatedUser = {
					name: ''
				};

				request(app)
					.put('/api/user/update')
					.set('Cookie', userCredentials)
					.send(updatedUser)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('User name is required');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to update name', done => {
				request(app)
					.put('/api/user/update')
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

	describe('PATCH /api/user/notifications', () => {
		describe('Valid request tests', () => {
			it('should allow user to mark all notifications as read', done => {
				request(app)
					.patch('/api/user/notifications')
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						res.body.notifications.forEach((notification: any) => {
							expect(notification.isRead).toBe(true);
						});
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to mark all notifications as read', done => {
				request(app)
					.patch('/api/user/notifications')
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

	describe('PATCH /api/user/notifications/:notificationId', () => {
		describe('Valid request tests', () => {
			it('should allow user to mark a notifications as read', done => {
				request(app)
					.patch(`/api/user/notifications/${users[1].notifications[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.notifications[0].isRead).toBe(true);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.patch('/api/user/notifications/123')
					.set('Cookie', userCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Notification Id');
					})
					.end(done);
			});

			it('should throw an error if notification is not found', done => {
				request(app)
					.patch(`/api/user/notifications/${new mongoose.Types.ObjectId()}`)
					.set('Cookie', userCredentials)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Notification not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to mark a notifications as read', done => {
				request(app)
					.patch(`/api/user/notifications/${users[1].notifications[0]._id}`)
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

	describe('PATCH /api/user/tracks/:trackId', () => {
		describe('Valid request tests', () => {
			it('should allow user to update track progress', done => {
				const updatedTrack = {
					trackProgressIndex: 1
				};

				request(app)
					.patch(`/api/user/tracks/${tracks[0]._id}`)
					.set('Cookie', userCredentials)
					.send(updatedTrack)
					.expect(200)
					.expect(res => {
						expect(res.body.tracks[0].trackProgressIndex).toBe(
							users[1].tracks[0].trackProgressIndex + updatedTrack.trackProgressIndex
						);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should not allow user to update track without index', done => {
				request(app)
					.patch(`/api/user/tracks/${tracks[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Track progress required');
					})
					.end(done);
			});

			it('should not allow user to update track to negative number', done => {
				const updatedTrack = {
					trackProgressIndex: -10
				};

				request(app)
					.patch(`/api/user/tracks/${tracks[0]._id}`)
					.set('Cookie', userCredentials)
					.send(updatedTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Track progress cannot be negative');
					})
					.end(done);
			});

			it('should throw an error for invalid mongo id', done => {
				const updatedTrack = {
					trackProgressIndex: 1
				};

				request(app)
					.patch('/api/user/tracks/123')
					.set('Cookie', userCredentials)
					.send(updatedTrack)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Track Id');
					})
					.end(done);
			});

			it('should throw an error if track is not found', done => {
				const updatedTrack = {
					trackProgressIndex: 1
				};

				request(app)
					.patch(`/api/user/tracks/${new mongoose.Types.ObjectId()}`)
					.set('Cookie', userCredentials)
					.send(updatedTrack)
					.expect(404)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Track not found');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to update track progress', done => {
				request(app)
					.patch(`/api/user/tracks/${tracks[0]._id}`)
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

	describe('PATCH /api/user/admin-status', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to change admin status', done => {
				const user = {
					userId: users[1]._id
				};

				request(app)
					.patch('/api/user/admin-status')
					.set('Cookie', superAdminCredentials)
					.send(user)
					.expect(200)
					.expect(res => {
						expect(res.body.user.isAdmin).toBe(!users[1].isAdmin);
					})
					.end(done);
			});

			it('should make super admin false if admin is false', done => {
				const user = {
					userId: users[0]._id
				};

				request(app)
					.patch('/api/user/admin-status')
					.set('Cookie', superAdminCredentials)
					.send(user)
					.expect(200)
					.expect(res => {
						expect(res.body.user.isAdmin).toBe(!users[0].isAdmin);
						expect(res.body.user.isSuperAdmin).toBe(false);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				const user = {
					userId: '123'
				};

				request(app)
					.patch('/api/user/admin-status')
					.set('Cookie', superAdminCredentials)
					.send(user)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid User Id');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			const user = {
				userId: users[0]._id
			};

			it('should not allow unauthenticated user to change admin status', done => {
				request(app)
					.patch('/api/user/admin-status')
					.send(user)
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
			it('should not allow authenticated user to change admin status', done => {
				const user = {
					userId: users[0]._id
				};

				request(app)
					.patch('/api/user/admin-status')
					.set('Cookie', userCredentials)
					.send(user)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to change admin status', done => {
				const user = {
					userId: users[0]._id
				};

				request(app)
					.patch('/api/user/admin-status')
					.set('Cookie', adminCredentials)
					.send(user)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});

	describe('PATCH /api/user/super-admin-status', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to change super admin status', done => {
				const user = {
					userId: users[0]._id
				};

				request(app)
					.patch('/api/user/super-admin-status')
					.set('Cookie', superAdminCredentials)
					.send(user)
					.expect(200)
					.expect(res => {
						expect(res.body.user.isSuperAdmin).toBe(!users[0].isSuperAdmin);
					})
					.end(done);
			});

			it('should make admin true if super admin is true', done => {
				const user = {
					userId: users[1]._id
				};

				request(app)
					.patch('/api/user/super-admin-status')
					.set('Cookie', superAdminCredentials)
					.send(user)
					.expect(200)
					.expect(res => {
						expect(res.body.user.isSuperAdmin).toBe(!users[1].isSuperAdmin);
						expect(res.body.user.isAdmin).toBe(true);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				const user = {
					userId: '123'
				};

				request(app)
					.patch('/api/user/super-admin-status')
					.set('Cookie', superAdminCredentials)
					.send(user)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid User Id');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated user to change super admin status', done => {
				const user = {
					userId: users[0]._id
				};

				request(app)
					.patch('/api/user/super-admin-status')
					.send(user)
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
			it('should not allow authenticated to change super admin status', done => {
				const user = {
					userId: users[0]._id
				};

				request(app)
					.patch('/api/user/super-admin-status')
					.set('Cookie', userCredentials)
					.send(user)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to change super admin status', done => {
				const user = {
					userId: users[0]._id
				};

				request(app)
					.patch('/api/user/super-admin-status')
					.set('Cookie', adminCredentials)
					.send(user)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});
		});
	});

	describe('DELETE /api/user/favorites/:tutorialId', () => {
		describe('Valid request tests', () => {
			it('should allow user to remove tutorial from favorites', done => {
				request(app)
					.delete(`/api/user/favorites/${tutorials[2]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						const isTutorialRemoved = res.body.favorites.every(
							(favorite: any) =>
								favorite.toHexString() !== tutorials[2]._id.toHexString()
						);

						expect(res.body.favorites.length).toBe(users[1].favorites.length - 1);
						expect(isTutorialRemoved).toBe(true);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.delete('/api/user/favorites/123')
					.set('Cookie', userCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Tutorial Id');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated remove tutorial from favorites', done => {
				request(app)
					.delete(`/api/user/favorites/${tutorials[2]._id}`)
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

	describe('DELETE /api/user/tracks/:trackId', () => {
		describe('Valid request tests', () => {
			it('should allow user to unsubscribe from track', done => {
				request(app)
					.delete(`/api/user/tracks/${tracks[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(200)
					.expect(res => {
						const isTrackRemoved = res.body.tracks.every(
							(track: any) =>
								track.track.toHexString() !== tracks[0]._id.toHexString()
						);

						expect(res.body.tracks.length).toBe(users[1].tracks.length - 1);
						expect(isTrackRemoved).toBe(true);
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.delete('/api/user/tracks/123')
					.set('Cookie', userCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid Track Id');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated to unsubscribe from track', done => {
				request(app)
					.delete(`/api/user/tracks/${tracks[0]._id}`)
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

	describe('DELETE /api/user/delete/:userId', () => {
		describe('Valid request tests', () => {
			it('should allow super admin to delete user', done => {
				request(app)
					.delete(`/api/user/delete/${users[1]._id}`)
					.set('Cookie', superAdminCredentials)
					.expect(200)
					.expect(res => {
						expect(res.body.user._id).toBe(users[1]._id.toHexString());
					})
					.end(done);
			});
		});

		describe('Validation tests', () => {
			it('should throw an error for invalid mongo id', done => {
				request(app)
					.delete('/api/user/delete/123')
					.set('Cookie', superAdminCredentials)
					.expect(400)
					.expect(res => {
						expect(res.body.errorMessage).toBe('Invalid User Id');
					})
					.end(done);
			});
		});

		describe('Auth validation tests', () => {
			it('should not allow unauthenticated to delete user', done => {
				request(app)
					.delete(`/api/user/delete/${users[1]._id}`)
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
			it('should not allow authenticated user to delete user', done => {
				request(app)
					.delete(`/api/user/delete/${users[0]._id}`)
					.set('Cookie', userCredentials)
					.expect(403)
					.expect(res => {
						expect(res.body.errorMessage).toBe('SuperAdmin access required');
					})
					.end(done);
			});

			it('should not allow admin to delete user', done => {
				request(app)
					.delete(`/api/user/delete/${users[1]._id}`)
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
