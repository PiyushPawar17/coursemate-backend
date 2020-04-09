import { Request, Response } from 'express';
import mongoose from 'mongoose';

import User from '../models/User';
import Tutorial from '../models/Tutorial';
import { IUser } from '../models/types';

import { validateUser, validateTrackProgress } from '../utils/user.utils';

// Routes for /api/user

// ----- GET REQUESTS -----

// Route -> /api/user/submitted-tutorials
// Access -> Private
export const getSubmittedTutorials = (req: Request, res: Response) => {
	const user = req.user as IUser;

	Tutorial.find({ 'submittedBy.userId': user._id })
		.populate('tags', ['name', 'slug'])
		.then(tutorials => {
			res.json({ tutorials });
		})
		.catch(error => {
			if (error.name === 'MissingSchemaError') {
				res.json({ user: user._id, tutorials: [] });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to get submitted tutorials' });
			}
		});
};

// Route -> /api/user/favorites
// Access -> Private
export const getFavorites = (req: Request, res: Response) => {
	const user = req.user as IUser;

	User.findById(user._id)
		.populate({ path: 'favorites' })
		.populate({ path: 'favorites', populate: { path: 'tags', select: 'name slug' } })
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				res.json({ favorites: user.favorites });
			}
		})
		.catch(error => {
			if (error.name === 'MissingSchemaError') {
				res.json({ user: user._id, favorites: [] });
			} else if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to get favorites' });
			}
		});
};

// Route -> /api/user/tracks
// Access -> Private
export const getTracks = (req: Request, res: Response) => {
	const user = req.user as IUser;

	User.findById(user._id)
		.populate({ path: 'tracks.track', populate: { path: 'track' } })
		.populate({
			path: 'tracks.track',
			populate: {
				path: 'tutorials',
				populate: { path: 'tags', select: 'name slug' }
			}
		})
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				res.json({ user: user._id, tracks: user.tracks });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to get subscribed tracks' });
			}
		});
};

// Route -> /api/user/all-users
// Access -> SuperAdmin
export const getAllUsers = (req: Request, res: Response) => {
	User.find({})
		.then(users => {
			res.json({ users });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to get the users' });
		});
};

// ----- POST REQUESTS -----

// Route -> /api/user/favorites/:tutorialId
// Access -> Private
export const addToFavorites = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	const user = req.user as IUser;

	User.findByIdAndUpdate(user._id, { $addToSet: { favorites: tutorialId } }, { new: true })
		.populate({ path: 'favorites' })
		.populate({ path: 'favorites', populate: { path: 'tags', select: 'name slug' } })
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				res.json({ user: user._id, favorites: user.favorites });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to add to favorites' });
			}
		});
};

// Route -> /api/user/tracks/:trackId
// Access -> Private
export const subscribeToTrack = (req: Request, res: Response) => {
	const { trackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(trackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Track Id' });
	}

	const user = req.user as IUser;

	User.findById(user._id)
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else if (!user.tracks) {
				// If not subscribed to any track
				return User.findByIdAndUpdate(
					user._id,
					{ $addToSet: { tracks: { track: trackId } } },
					{ new: true }
				);
			} else {
				const track = user.tracks.filter(track => track.track.toHexString() === trackId)[0];

				// Check if not subscribed to track
				if (!track) {
					return User.findByIdAndUpdate(
						user._id,
						{ $addToSet: { tracks: { track: trackId } } },
						{ new: true }
					);
				} else {
					return Promise.resolve(user);
				}
			}
		})
		.then(user => {
			if (user) {
				User.findById(user._id)
					.populate({ path: 'tracks.track', populate: { path: 'track' } })
					.populate({
						path: 'tracks.track',
						populate: {
							path: 'tutorials',
							populate: { path: 'tags', select: 'name slug' }
						}
					})
					.then(user => {
						if (!user) {
							return Promise.reject({
								customError: true,
								errorCode: 404,
								errorMessage: 'User not found'
							});
						} else {
							res.json({ user: user._id, tracks: user.tracks });
						}
					});
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to subscribe to the track' });
			}
		});
};

// ----- PUT REQUESTS -----

// Route -> /api/user/update
// Access -> Private
export const updateUser = (req: Request, res: Response) => {
	const { value: updatedUser, error } = validateUser(req.body);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	const user = req.user as IUser;

	User.findByIdAndUpdate(user._id, { name: updatedUser.name }, { new: true })
		.then(currentUser => {
			if (!currentUser) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				const { _id, name, email, displayPicture, isAdmin, isSuperAdmin } = currentUser;
				const user = {
					_id,
					name,
					email,
					displayPicture,
					isAdmin,
					isSuperAdmin
				};

				res.json({ user });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to update user info' });
			}
		});
};

// ----- PATCH REQUESTS -----

// Route -> /api/user/tracks/:trackId
// Access -> Private
export const updateTrackProgress = (req: Request, res: Response) => {
	const { trackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(trackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Track Id' });
	}

	const { value: updatedTrackProgress, error } = validateTrackProgress(req.body);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	const user = req.user as IUser;

	User.findById(user._id)
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				if (!user.tracks) {
					return Promise.reject({
						customError: true,
						errorCode: 404,
						errorMessage: 'Track not found'
					});
				} else {
					const track = user.tracks.filter(t => t.track.toHexString() === trackId)[0];

					// Check if subscribed to track
					if (!track) {
						return Promise.reject({
							customError: true,
							errorCode: 404,
							errorMessage: 'Track not found'
						});
					} else {
						track.trackProgressIndex += updatedTrackProgress.trackProgressIndex;

						return user.save();
					}
				}
			}
		})
		.then(user => {
			res.json({ user: user._id, trackId, tracks: user.tracks });
		})
		.catch(error => {
			if (error.name === 'ValidationError') {
				res.status(400).json({ error, errorMessage: 'Track progress cannot be negative' });
			} else if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to update track progress' });
			}
		});
};

// Route -> /api/user/admin-status
// Access -> SuperAdmin
export const changeAdminStatus = (req: Request, res: Response) => {
	const { userId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid User Id' });
	}

	User.findById(userId)
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				// Make super admin false if admin is false
				const updatedStatus = {
					isAdmin: !user.isAdmin,
					isSuperAdmin: !user.isAdmin ? user.isSuperAdmin : false
				};

				return User.findByIdAndUpdate(userId, updatedStatus, { new: true });
			}
		})
		.then(updatedUser => {
			if (!updatedUser) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				const { _id, name, email, displayPicture, isAdmin, isSuperAdmin } = updatedUser;
				const user = {
					_id,
					name,
					email,
					displayPicture,
					isAdmin,
					isSuperAdmin
				};

				res.json({ user });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to change admin status' });
			}
		});
};

// Route -> /api/user/super-admin-status
// Access -> SuperAdmin
export const changeSuperAdminStatus = (req: Request, res: Response) => {
	const { userId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid User Id' });
	}

	User.findById(userId)
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				// Make admin true when when super admin is true
				return User.findByIdAndUpdate(
					userId,
					{ isSuperAdmin: !user.isSuperAdmin, isAdmin: true },
					{ new: true }
				);
			}
		})
		.then(updatedUser => {
			if (!updatedUser) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				const { _id, name, email, displayPicture, isAdmin, isSuperAdmin } = updatedUser;
				const user = {
					_id,
					name,
					email,
					displayPicture,
					isAdmin,
					isSuperAdmin
				};

				res.json({ user });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({
					error,
					errorMessage: 'Unable to change super admin status'
				});
			}
		});
};

// ----- DELETE REQUESTS -----

// Route -> /api/user/favorites/:tutorialId
// Access -> Private
export const removeFromFavorites = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	const user = req.user as IUser;

	User.findByIdAndUpdate(user._id, { $pull: { favorites: tutorialId } }, { new: true })
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				res.json({ user: user._id, favorites: user.favorites });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to remove from favorites' });
			}
		});
};

// Route -> /api/user/tracks/:trackId
// Access -> Private
export const unsubscribeFromTrack = (req: Request, res: Response) => {
	const { trackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(trackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Track Id' });
	}

	const user = req.user as IUser;

	User.findByIdAndUpdate(user._id, { $pull: { tracks: { track: trackId } } }, { new: true })
		.populate({ path: 'tracks.track', populate: { path: 'track' } })
		.populate({
			path: 'tracks.track',
			populate: {
				path: 'tutorials',
				populate: { path: 'tags', select: 'name slug' }
			}
		})
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				res.json({ user: user._id, tracks: user.tracks });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({
					error,
					errorMessage: 'Unable to unsubscribe from the track'
				});
			}
		});
};

// Route -> /api/user/delete/:userId
// Access -> SuperAdmin
export const deleteUser = (req: Request, res: Response) => {
	const { userId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid User Id' });
	}

	User.findByIdAndRemove(userId)
		.then(user => {
			if (!user) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'User not found'
				});
			} else {
				res.json({ user });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to delete user' });
			}
		});
};
