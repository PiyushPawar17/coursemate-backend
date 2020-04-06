import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Track from '../models/Track';
import { IUser } from '../models/types';

import { validateTrack, validateUpdate } from '../utils/tracks.utils';

// Routes for /api/tracks

// ----- GET REQUESTS -----

// Route -> /api/tracks
// Access -> Public
export const getAllTracks = (req: Request, res: Response) => {
	Track.find({})
		.sort({ name: 1 })
		.then(tracks => {
			res.json({ tracks });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to get the tracks' });
		});
};

// Route -> /api/tracks/track/:trackId
// Access -> Public
export const getTrack = (req: Request, res: Response) => {
	const { trackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(trackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Track Id' });
	}

	Track.findById(trackId)
		.populate({ path: 'tutorials' })
		.populate({ path: 'tutorials', populate: { path: 'tags', select: 'name slug' } })
		.then(track => {
			if (!track) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Track not found'
				});
			} else {
				res.json({ track });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to get the track' });
			}
		});
};

// Route -> /api/tracks/unapproved
// Access -> Admin
export const getUnapprovedTracks = (req: Request, res: Response) => {
	Track.find({ isApproved: false })
		.sort({ createdAt: -1 })
		.then(unapprovedTracks => {
			res.json({ tracks: unapprovedTracks });
		})
		.catch(error => {
			res.status(500).json({
				error,
				errorMessage: 'Unable to change approved status of the track'
			});
		});
};

// ----- POST REQUESTS -----

// Route -> /api/tracks
// Access -> Private
export const addTrack = (req: Request, res: Response) => {
	const { value: newTrack, error } = validateTrack(req.body);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	const user = req.user as IUser;

	const track = new Track({
		...newTrack,
		submittedBy: {
			name: user.name,
			userId: user._id
		}
	});

	track
		.save()
		.then(newTrack => {
			res.status(201).json({ track: newTrack });
		})
		.catch(error => {
			if (error.code === 11000) {
				res.status(400).json({ error, errorMessage: 'Track already exist' });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to add track' });
			}
		});
};

// ----- PUT REQUESTS -----

// Route -> /api/tracks/update/:trackId
// Access -> Admin
export const updateTrack = (req: Request, res: Response) => {
	const { trackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(trackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Track Id' });
	}

	const { value: updatedTrack, error } = validateUpdate(req.body);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	Track.findById(trackId)
		.then(trackToUpdate => {
			if (!trackToUpdate) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Track not found'
				});
			} else {
				const { name, ...rest } = updatedTrack;
				// Check if name is updated
				if (name) {
					trackToUpdate.name = name;
					// Call save to update the track slug
					return trackToUpdate.save().then(() => {
						// Update rest of the fields
						return Track.findByIdAndUpdate(trackId, rest, { new: true })
							.populate({ path: 'tutorials' })
							.populate({
								path: 'tutorials',
								populate: { path: 'tags', select: 'name slug' }
							});
					});
				} else {
					// Update the fields if name is not updated
					return Track.findByIdAndUpdate(trackId, rest, { new: true })
						.populate({ path: 'tutorials' })
						.populate({
							path: 'tutorials',
							populate: { path: 'tags', select: 'name slug' }
						});
				}
			}
		})
		.then(track => {
			res.json({ track });
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to update track' });
			}
		});
};

// ----- PATCH REQUESTS -----

// Route -> /api/tracks/approved-status
// Access -> Admin
export const changeApprovedStatus = (req: Request, res: Response) => {
	const { trackId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(trackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Track Id' });
	}

	Track.findById(trackId)
		.then(track => {
			if (!track) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Track not found'
				});
			} else {
				return Track.findByIdAndUpdate(
					trackId,
					{ isApproved: !track.isApproved },
					{ new: true }
				);
			}
		})
		.then(updatedTrack => {
			res.json({ track: updatedTrack });
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({
					error,
					errorMessage: 'Unable to change approved status of the track'
				});
			}
		});
};

// ----- DELETE REQUESTS -----

// Route -> /api/tracks/track/:trackId
// Access -> Admin
export const deleteTrack = (req: Request, res: Response) => {
	const { trackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(trackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Track Id' });
	}

	Track.findByIdAndDelete(trackId)
		.then(deletedTrack => {
			if (!deletedTrack) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Track not found'
				});
			} else {
				res.json({ track: deletedTrack });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to delete track' });
			}
		});
};

// Route -> /api/tracks/cancel/:trackId
// Access -> Private
export const cancelRequest = (req: Request, res: Response) => {
	const { trackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(trackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Track Id' });
	}

	const user = req.user as IUser;

	Track.findById(trackId)
		.then(track => {
			if (!track) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Track not found'
				});
			} else {
				if (track.submittedBy.userId.toHexString() !== user._id.toHexString()) {
					return Promise.reject({
						customError: true,
						errorCode: 403,
						errorMessage: 'Only track owner can cancel request'
					});
				} else if (track.isApproved) {
					return Promise.reject({
						customError: true,
						errorCode: 403,
						errorMessage: 'Track is approved and cannot be deleted. Contact Admin.'
					});
				} else {
					return Track.findByIdAndDelete(trackId);
				}
			}
		})
		.then(deletedTrack => {
			res.json({ track: deletedTrack });
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to cancel request' });
			}
		});
};
