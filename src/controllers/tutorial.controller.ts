import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Tutorial from '../models/Tutorial';
import { IUser } from '../models/types';

import { validateTutorial, validateUpdate } from '../utils/tutorials.utils';

// Routes for /api/tutorials

// ----- GET REQUESTS -----

// Route -> /api/tutorials
// Access -> Public
export const getAllTutorials = (req: Request, res: Response) => {
	Tutorial.find({})
		.sort({ title: 1 })
		.populate('tags', ['name', 'slug'])
		.then(tutorials => {
			res.json({ tutorials });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to get tutorials' });
		});
};

// Route -> /api/tutorials/tutorial/:tutorialId
// Access -> Public
export const getTutorial = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	Tutorial.findById(tutorialId)
		.populate('tags', ['name', 'slug'])
		.then(tutorial => {
			if (!tutorial) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tutorial not found'
				});
			} else {
				res.json({ tutorial });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to get the tutorial' });
			}
		});
};

// Route -> /api/tutorials/tag/:tagId
// Access -> Public
export const getTutorialsByTag = (req: Request, res: Response) => {
	const { tagId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tagId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tag Id' });
	}

	const id = new mongoose.Types.ObjectId(tagId);

	Tutorial.find({ tags: id })
		.sort({ title: 1 })
		.populate('tags', ['name', 'slug'])
		.then(tutorials => {
			res.json({ tutorials });
		})
		.catch(error => {
			res.status(500).json({
				error,
				errorMessage: 'Unable to get tutorials of the given tag'
			});
		});
};

// Route -> /api/tutorials/unapproved
// Access -> Admin
export const getUnapprovedTutorials = (req: Request, res: Response) => {
	Tutorial.find({ isApproved: false })
		.sort({ createdAt: -1 })
		.populate('tags', ['name', 'slug'])
		.then(unapprovedTutorials => {
			res.json({ tutorials: unapprovedTutorials });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to get unapproved tutorials' });
		});
};

// ----- POST REQUESTS -----

// Route -> /api/tutorials
// Access -> Private
export const addTutorial = (req: Request, res: Response) => {
	const { value: newTutorial, error } = validateTutorial(req.body);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	const user = req.user as IUser;

	const tutorial = new Tutorial({
		...newTutorial,
		submittedBy: {
			name: user.name,
			userId: user._id
		}
	});

	tutorial
		.save()
		.then(newTutorial => {
			res.status(201).json({ tutorial: newTutorial });
		})
		.catch(error => {
			if (error.code === 11000) {
				res.status(400).json({ error, errorMessage: 'Tutorial already exist' });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to add tutorial' });
			}
		});
};

// Route -> /api/tutorials/upvote/:tutorialId
// Access -> Private
export const addUpvote = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	const user = req.user as IUser;

	Tutorial.findByIdAndUpdate(tutorialId, { $addToSet: { upvotes: user._id } }, { new: true })
		.then(updatedTutorial => {
			if (!updatedTutorial) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tutorial not found'
				});
			}

			res.json({ tutorial: updatedTutorial._id, upvotes: updatedTutorial.upvotes });
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to add upvote' });
			}
		});
};

// ----- PUT REQUESTS -----

// Route -> /api/tutorials/update/:tutorialId
// Access -> Admin
export const updateTutorial = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	const tutorial = {
		...req.body
	};

	const { value: updatedTutorial, error } = validateUpdate(tutorial);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	Tutorial.findById(tutorialId)
		.then(tutorialToUpdate => {
			if (!tutorialToUpdate) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tutorial not found'
				});
			} else {
				const { title, ...rest } = updatedTutorial;
				// Check if title is updated
				if (title) {
					tutorialToUpdate.title = title;
					// Call save to update the tutorial slug
					return tutorialToUpdate.save().then(() => {
						// Update rest of the fields
						return Tutorial.findByIdAndUpdate(tutorialId, rest, {
							new: true
						}).populate('tags', ['name', 'slug']);
					});
				} else {
					// Update the fields if title is not updated
					return Tutorial.findByIdAndUpdate(tutorialId, rest, {
						new: true
					}).populate('tags', ['name', 'slug']);
				}
			}
		})
		.then(tutorial => {
			res.json({ tutorial });
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to update tutorial' });
			}
		});
};

// ----- PATCH REQUESTS -----

// Route -> /api/tutorials/approved-status
// Access -> Admin
export const changeApprovedStatus = (req: Request, res: Response) => {
	const { tutorialId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	Tutorial.findById(tutorialId)
		.then(tutorial => {
			if (!tutorial) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tutorial not found'
				});
			} else {
				return Tutorial.findByIdAndUpdate(
					tutorialId,
					{ isApproved: !tutorial.isApproved },
					{ new: true }
				);
			}
		})
		.then(updatedTutorial => {
			res.json({ tutorial: updatedTutorial });
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({
					error,
					errorMessage: 'Unable to change approved status of the tutorial'
				});
			}
		});
};

// ----- DELETE REQUESTS -----

// Route -> /api/tutorials/tutorial/:tutorialId
// Access -> Admin
export const deleteTutorial = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	Tutorial.findByIdAndDelete(tutorialId)
		.then(deletedTutorial => {
			if (!deletedTutorial) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tutorial not found'
				});
			} else {
				res.json({ tutorial: deletedTutorial });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to delete tutorial' });
			}
		});
};

// Route -> /api/tutorials/upvote/:tutorialId
// Access -> Private
export const removeUpvote = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	const user = req.user as IUser;

	Tutorial.findByIdAndUpdate(tutorialId, { $pull: { upvotes: user._id } }, { new: true })
		.then(updatedTutorial => {
			if (!updatedTutorial) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tutorial not found'
				});
			} else {
				res.json({ tutorial: updatedTutorial._id, upvotes: updatedTutorial.upvotes });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to remove upvote' });
			}
		});
};

// Route -> /api/tutorials/cancel/:tutorialId
// Access -> Private
export const cancelRequest = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tutorial Id' });
	}

	const user = req.user as IUser;

	Tutorial.findById(tutorialId)
		.then(tutorial => {
			if (!tutorial) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tutorial not found'
				});
			} else {
				if (tutorial.submittedBy.userId.toHexString() !== user._id.toHexString()) {
					return Promise.reject({
						customError: true,
						errorCode: 403,
						errorMessage: 'Only tutorial owner can cancel request'
					});
				} else if (tutorial.isApproved) {
					return Promise.reject({
						customError: true,
						errorCode: 403,
						errorMessage: 'Tutorial is approved and cannot be deleted. Contact Admin.'
					});
				} else {
					return Tutorial.findByIdAndDelete(tutorialId);
				}
			}
		})
		.then(deletedTutorial => {
			if (!deletedTutorial) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tutorial not found'
				});
			} else {
				res.json({ tutorial: deletedTutorial });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to cancel the request' });
			}
		});
};
