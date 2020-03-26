import { Request, Response } from 'express';
import mongoose from 'mongoose';
import normalizeUrl from 'normalize-url';

import Tutorial from '../models/Tutorial';
import { IUser } from '../models/types';

import { validateTutorial, validateComment, validateUpdate } from '../utils/tutorials.utils';

// Routes for /api/tutorials

// ----- GET REQUESTS -----

// Route -> /api/tutorials
// Access -> Public
export const getAllTutorials = (req: Request, res: Response) => {
	Tutorial.find({})
		.populate('tags', ['name', 'url', 'isApproved'])
		.then(tutorials => {
			res.json({ tutorials });
		})
		.catch(error => {
			res.json({ error });
		});
};

// Route -> /api/tutorials/tutorial/:tutorialId
// Access -> Public
export const getTutorial = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial ID' });
	}

	Tutorial.findById(tutorialId)
		.populate('tags', ['name', 'url', 'isApproved'])
		.then(tutorial => {
			if (!tutorial) {
				res.status(404).json({ error: 'Tutorial not found' });
			} else {
				res.json({ tutorial });
			}
		})
		.catch(error => {
			res.json({ error });
		});
};

// Route -> /api/tutorials/tag/:tagId
// Access -> Public
export const getTutorialByTag = (req: Request, res: Response) => {
	const { tagId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tagId)) {
		return res.status(400).json({ error: 'Inavlid Tag ID' });
	}

	const id = new mongoose.Types.ObjectId(tagId);

	Tutorial.find({ tags: id })
		.populate('tags', ['name', 'url', 'isApproved'])
		.then(tutorials => {
			res.json({ tutorials });
		})
		.catch(error => {
			res.json({ error });
		});
};

// Route -> /api/tutorials/unapproved
// Access -> Admin
export const getUnapprovedTutorials = (req: Request, res: Response) => {
	Tutorial.find({ isApproved: false })
		.populate('tags', ['name', 'url', 'isApproved'])
		.sort({ createdAt: -1 })
		.then(unapprovedTutorials => {
			res.json({ tutorials: unapprovedTutorials });
		})
		.catch(error => {
			res.json({ error });
		});
};

// ----- POST REQUESTS -----

// Route -> /api/tutorials
// Access -> Private
export const addTutorial = (req: Request, res: Response) => {
	const { value: newTutorial, error } = validateTutorial({
		...req.body,
		link: normalizeUrl(req.body.link, {
			defaultProtocol: 'https://',
			stripHash: true,
			removeQueryParameters: ['*']
		})
	});

	if (error) {
		return res.status(400).json({ error: error.details[0].message });
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
				res.status(400).json({ error: 'Tutorial already exist' });
			} else {
				res.json({ error });
			}
		});
};

// Route -> /api/tutorials/upvote/:tutorialId
// Access -> Private
export const addUpvote = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial ID' });
	}

	const user = req.user as IUser;

	Tutorial.findByIdAndUpdate(tutorialId, { $addToSet: { upvotes: user._id } }, { new: true })
		.then(updatedTutorial => {
			if (!updatedTutorial) {
				return res.status(404).json({ error: 'Tutorial not found' });
			}

			res.json({ tutorial: updatedTutorial._id, upvotes: updatedTutorial.upvotes });
		})
		.catch(error => {
			res.json({ error });
		});
};

// Route -> /api/tutorials/comment/:tutorialId
// Access -> Private
export const addComment = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial ID' });
	}

	const { value, error } = validateComment(req.body);

	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	const user = req.user as IUser;
	const newComment = {
		...value,
		commentedBy: user.name,
		userId: user._id
	};

	Tutorial.findByIdAndUpdate(tutorialId, { $push: { comments: newComment } }, { new: true })
		.then(updatedTutorial => {
			if (!updatedTutorial) {
				return res.status(404).json({ error: 'Tutorial not found' });
			}

			res.json({ tutorial: updatedTutorial._id, comments: updatedTutorial.comments });
		})
		.catch(error => {
			res.json({ error });
		});
};

// ----- PUT REQUESTS -----

// Route -> /api/tutorials/update
// Access -> Admin
export const updateTutorial = (req: Request, res: Response) => {
	const { tutorialId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial ID' });
	}

	const tutorial = {
		...req.body
	};

	if (req.body.link) {
		tutorial.link = normalizeUrl(req.body.link, {
			defaultProtocol: 'https://',
			stripHash: true,
			removeQueryParameters: ['*']
		});
	}

	const { value: updatedTutorial, error } = validateUpdate(tutorial);

	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	Tutorial.findByIdAndUpdate(tutorialId, updatedTutorial, { new: true })
		.populate('tags', ['name', 'url', 'isApproved'])
		.then(tutorial => {
			if (!tutorial) {
				return res.status(404).json({ error: 'Tutorial not found' });
			}

			res.status(200).json({ tutorial });
		})
		.catch(error => {
			res.json({ error });
		});
};

// ----- PATCH REQUESTS -----

// Route -> /api/tutorials/approved-status
// Access -> Admin
export const changeApprovedStatus = (req: Request, res: Response) => {
	const { tutorialId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tag ID' });
	}

	Tutorial.findById(tutorialId)
		.then(tutorial => {
			if (!tutorial) {
				res.status(404).json({ error: 'Tutorial not found' });
			} else {
				return Tutorial.findByIdAndUpdate(tutorialId, { isApproved: !tutorial.isApproved }, { new: true });
			}
		})
		.then(updatedTutorial => {
			res.json({ tutorial: updatedTutorial });
		})
		.catch(error => {
			res.json({ error });
		});
};

// ----- DELETE REQUESTS -----

// Route -> /api/tutorials/tutorial/:tutorialId
// Access -> Admin
export const deleteTutorial = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tag ID' });
	}

	Tutorial.findByIdAndDelete(tutorialId)
		.then(deletedTutorial => {
			if (!deletedTutorial) {
				res.status(404).json({ error: 'Tutorial not found' });
			} else {
				res.json({ tutorial: deletedTutorial });
			}
		})
		.catch(error => {
			res.json({ error });
		});
};

// Route -> /api/tutorials/upvote/:tutorialId
// Access -> Private
export const removeUpvote = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial ID' });
	}

	const user = req.user as IUser;

	Tutorial.findByIdAndUpdate(tutorialId, { $pull: { upvotes: user._id } }, { new: true })
		.then(updatedTutorial => {
			if (!updatedTutorial) {
				return res.status(404).json({ error: 'Tutorial not found' });
			}

			res.json({ tutorial: updatedTutorial._id, upvotes: updatedTutorial.upvotes });
		})
		.catch(error => {
			res.json({ error });
		});
};

// Route -> /api/tutorials/comment/:tutorialId/:commentId
// Access -> Private
export const removeComment = (req: Request, res: Response) => {
	const { tutorialId, commentId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial ID' });
	}

	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		return res.status(400).json({ error: 'Inavlid Comment ID' });
	}

	Tutorial.findByIdAndUpdate(tutorialId, { $pull: { comments: { _id: commentId } } }, { new: true })
		.then(updatedTutorial => {
			if (!updatedTutorial) {
				return res.status(404).json({ error: 'Tutorial not found' });
			}

			res.json({ tutorial: updatedTutorial._id, comments: updatedTutorial.comments });
		})
		.catch(error => {
			res.json({ error });
		});
};

// Route -> /api/tutorials/cancel/:tutorialId
// Access -> Private
export const cancelRequest = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial ID' });
	}

	const user = req.user as IUser;

	Tutorial.findById(tutorialId)
		.then(tutorial => {
			if (!tutorial) {
				res.status(404).json({ error: 'Tutorial not found' });
			} else {
				if (tutorial.submittedBy.userId.toHexString() !== user._id.toHexString()) {
					res.status(403).json({ error: 'Only tutorial owner can cancel request' });
				} else if (tutorial.isApproved) {
					res.status(403).json({ error: 'Tutorial is approved and cannot be deleted. Contact Admin.' });
				} else {
					return Tutorial.findByIdAndDelete(tutorialId);
				}
			}
		})
		.then(deletedTutorial => {
			res.json({ tutorial: deletedTutorial });
		})
		.catch(error => {
			res.json({ error });
		});
};
