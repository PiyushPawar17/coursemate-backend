import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Feedback from '../models/Feedback';
import { IUser } from '../models/types';

import { validateFeedback } from '../utils/feedbacks.utils';

// Routes for /api/tags

// ----- GET REQUESTS -----

// Route -> /api/feedbacks
// Access -> SuperAdmin
export const getAllFeedbacks = (req: Request, res: Response) => {
	Feedback.find({})
		.sort({ createdAt: -1 })
		.then(feedbacks => {
			res.json({ feedbacks });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to get feedbacks' });
		});
};

// Route -> /api/feedbacks/:feedbackId
// Access -> SuperAdmin
export const getFeedback = (req: Request, res: Response) => {
	const { feedbackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Feedback Id' });
	}

	Feedback.findById(feedbackId)
		.then(feedback => {
			if (!feedback) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Feedback not found'
				});
			} else {
				res.json({ feedback });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to get the feedback' });
			}
		});
};

// ----- POST REQUESTS -----

// Route -> /api/feedbacks
// Access -> Private
export const submitFeedback = (req: Request, res: Response) => {
	const { value: newFeedback, error } = validateFeedback(req.body);

	if (error) {
		return res.status(400).json({ error: true, errorMessage: error.details[0].message });
	}

	const user = req.user as IUser;

	const feedback = new Feedback({
		...newFeedback,
		submittedBy: {
			name: user.name,
			userId: user._id
		}
	});

	feedback
		.save()
		.then(newFeedback => {
			res.status(201).json({ feedback: newFeedback });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to submit feedback' });
		});
};

// ----- PATCH REQUESTS -----

// Route -> /api/feedbacks/read
// Access -> SuperAdmin
export const readAllFeedbacks = (req: Request, res: Response) => {
	Feedback.updateMany({}, { isRead: true })
		.then(() => {
			return Feedback.find({}).sort({ createdAt: -1 });
		})
		.then(feedbacks => {
			res.json({ feedbacks });
		})
		.catch(error => {
			res.status(500).json({ error, errorMessage: 'Unable to read add feedbacks' });
		});
};

// Route -> /api/feedbacks/read/:feedbackId
// Access -> SuperAdmin
export const readFeedback = (req: Request, res: Response) => {
	const { feedbackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Feedback Id' });
	}

	Feedback.findByIdAndUpdate(feedbackId, { isRead: true }, { new: true })
		.then(feedback => {
			if (!feedback) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Feedback not found'
				});
			} else {
				res.json({ feedback });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to read the feedback' });
			}
		});
};

// Route -> /api/feedbacks/unread/:feedbackId
// Access -> SuperAdmin
export const unreadFeedback = (req: Request, res: Response) => {
	const { feedbackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Feedback Id' });
	}

	Feedback.findByIdAndUpdate(feedbackId, { isRead: false }, { new: true })
		.then(feedback => {
			if (!feedback) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Feedback not found'
				});
			} else {
				res.json({ feedback });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to unread the feedback' });
			}
		});
};

// ----- DELETE REQUESTS -----

// Route -> /api/feedbacks/:feedbackId
// Access -> SuperAdmin
export const deleteFeedback = (req: Request, res: Response) => {
	const { feedbackId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
		return res.status(400).json({ error: true, errorMessage: 'Invalid Feedback Id' });
	}

	Feedback.findByIdAndDelete(feedbackId)
		.then(deletedFeedback => {
			if (!deletedFeedback) {
				return Promise.reject({
					customError: true,
					errorCode: 404,
					errorMessage: 'Feedback not found'
				});
			} else {
				res.json({ feedback: deletedFeedback });
			}
		})
		.catch(error => {
			if (error.customError) {
				res.status(error.errorCode).json({ error, errorMessage: error.errorMessage });
			} else {
				res.status(500).json({ error, errorMessage: 'Unable to delete feedback' });
			}
		});
};
