import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Tag from '../models/Tag';
import { IUser } from '../models/types';

import { validateTag } from '../utils/tags.utils';

// Routes for /api/tags

// ----- GET REQUESTS -----

// Route -> /api/tags
// Access -> Public
export const getAllTags = (req: Request, res: Response) => {
	Tag.find({ isApproved: true })
		.sort({ name: 1 })
		.then(tags => {
			res.json({ tags });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to get tags' });
		});
};

// Route -> /api/tags/unapproved
// Access -> Admin
export const getUnapprovedTags = (req: Request, res: Response) => {
	Tag.find({ isApproved: false })
		.sort({ createdAt: -1 })
		.then(unapprovedTags => {
			res.json({ tags: unapprovedTags });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to get unapproved tags' });
		});
};

// ----- POST REQUESTS -----

// Route -> /api/tags
// Access -> Private
export const addTag = (req: Request, res: Response) => {
	const { value: newTag, error } = validateTag(req.body);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	const user = req.user as IUser;

	const tag = new Tag({
		...newTag,
		submittedBy: user._id
	});

	tag.save()
		.then(newTag => {
			res.status(201).json({ tag: newTag });
		})
		.catch(error => {
			if (error.code === 11000) {
				res.status(400).json({ error, errorMessage: 'Tag already exist' });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to add the tag' });
			}
		});
};

// ----- PUT REQUESTS -----

// Route -> /api/tags/update
// Access -> Admin
export const updateTag = (req: Request, res: Response) => {
	const { tagId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(tagId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tag Id' });
	}

	const { value: updatedTag, error } = validateTag(req.body);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	Tag.findById(tagId)
		.then(tag => {
			if (!tag) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tag not found'
				});
			} else {
				tag.name = updatedTag.name;
				return tag.save();
			}
		})
		.then(tag => {
			res.json({ tag });
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to update the tag' });
			}
		});
};

// ----- PATCH REQUESTS -----

// Route -> /api/tags/approved-status
// Access -> Admin
export const changeApprovedStatus = (req: Request, res: Response) => {
	const { tagId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(tagId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tag Id' });
	}

	Tag.findById(tagId)
		.then(tag => {
			if (!tag) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tag not found'
				});
			} else {
				return Tag.findByIdAndUpdate(tagId, { isApproved: !tag.isApproved }, { new: true });
			}
		})
		.then(updatedTag => {
			res.json({ tag: updatedTag });
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({
					error,
					errorMessage: 'Unable to change approved status of the tag'
				});
			}
		});
};

// ----- DELETE REQUESTS -----

// Route -> /api/tags/:tagId
// Access -> Admin
export const deleteTag = (req: Request, res: Response) => {
	const { tagId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(tagId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Tag Id' });
	}

	Tag.findByIdAndDelete(tagId)
		.then(deletedTag => {
			if (!deletedTag) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Tag not found'
				});
			} else {
				res.json({ tag: deletedTag });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to delete the tag' });
			}
		});
};
