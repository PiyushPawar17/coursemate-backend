import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Tutorial from '../models/Tutorial';
import { IUser } from '../models/types';

import { validateTutorial, validateComment, validateUpdate } from '../utils/tutorials.utils';

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
			res.json({ error });
		});
};

// Route -> /api/tutorials/tutorial/:tutorialId
// Access -> Public
export const getTutorial = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
	}

	Tutorial.findById(tutorialId)
		.populate('tags', ['name', 'slug'])
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
		return res.status(400).json({ error: 'Inavlid Tag Id' });
	}

	const id = new mongoose.Types.ObjectId(tagId);

	Tutorial.find({ tags: id })
		.sort({ title: 1 })
		.populate('tags', ['name', 'slug'])
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
		.sort({ createdAt: -1 })
		.populate('tags', ['name', 'slug'])
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
	const { value: newTutorial, error } = validateTutorial(req.body);

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
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
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
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
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

// Route -> /api/tutorials/update/:tutorialId
// Access -> Admin
export const updateTutorial = (req: Request, res: Response) => {
	const { tutorialId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
	}

	const tutorial = {
		...req.body
	};

	const { value: updatedTutorial, error } = validateUpdate(tutorial);

	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	Tutorial.findById(tutorialId)
		.then(tutorialToUpdate => {
			if (!tutorialToUpdate) {
				res.status(404).json({ error: 'Tutorial not found' });
			} else {
				const { title, ...rest } = updatedTutorial;
				// Check if title is updated
				if (title) {
					tutorialToUpdate.title = title;
					// Call save to update the tutorial slug
					return tutorialToUpdate.save().then(() => {
						// Update rest of the fields
						return Tutorial.findByIdAndUpdate(tutorialId, rest, { new: true }).populate('tags', [
							'name',
							'slug'
						]);
					});
				} else {
					// Update the fields if title is not updated
					return Tutorial.findByIdAndUpdate(tutorialId, rest, { new: true }).populate('tags', [
						'name',
						'slug'
					]);
				}
			}
		})
		.then(tutorial => {
			res.json({ tutorial });
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
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
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
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
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
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
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
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
	}

	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		return res.status(400).json({ error: 'Inavlid Comment Id' });
	}

	const user = req.user as IUser;

	Tutorial.findById(tutorialId)
		.then(tutorial => {
			if (!tutorial) {
				res.status(404).json({ error: 'Tutorial not found' });
			} else {
				if (tutorial.comments) {
					const comment = tutorial.comments.filter(comment => comment._id.toHexString() === commentId)[0];

					if (!comment) {
						res.status(404).json({ error: 'Comment not found' });
					} else if (comment.userId.toHexString() !== user._id.toHexString()) {
						res.status(403).json({ error: 'Only comments by you can be deleted' });
					} else {
						return Tutorial.findByIdAndUpdate(
							tutorialId,
							{ $pull: { comments: { _id: commentId } } },
							{ new: true }
						);
					}
				} else {
					res.json({ error: 'Comment not found' });
				}
			}
		})
		.then(updatedTutorial => {
			if (updatedTutorial) {
				res.json({ tutorial: updatedTutorial._id, comments: updatedTutorial.comments });
			}
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
		return res.status(400).json({ error: 'Inavlid Tutorial Id' });
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
			if (deletedTutorial) {
				res.json({ tutorial: deletedTutorial });
			}
		})
		.catch(error => {
			res.json({ error });
		});
};
