import { Request, Response } from 'express';
import _ from 'lodash';

import User from '../models/User';

import { IUser } from '../models/types';

// Routes for /api/users

// ----- GET REQUESTS -----

// Route -> /api/user/submitted-tutorials
// Access -> Private
export const getSubmittedTutorials = (req: Request, res: Response) => {
	const user = req.user as IUser;

	User.findById(user._id)
		.populate('submittedTutorials')
		.then(currentUser => {
			const submittedTutorials = _.pick(currentUser, ['submittedTutorials']);

			res.json({ submittedTutorials });
		})
		.catch(err => {
			if (err.name === 'MissingSchemaError') {
				res.json({ submittedTutorials: [] });
			}
		});
};

// Route -> /api/user/favorites
// Access -> Private
export const getFavorites = (req: Request, res: Response) => {
	const user = req.user as IUser;

	User.findById(user._id)
		.populate('favorites')
		.then(currentUser => {
			const favorites = _.pick(currentUser, ['favorites']);

			res.json({ favorites });
		})
		.catch(err => {
			if (err.name === 'MissingSchemaError') {
				res.json({ favorites: [] });
			}
		});
};

// Route -> /api/user/notifications
// Access -> Private
export const getNotifications = (req: Request, res: Response) => {
	const user = req.user as IUser;

	User.findById(user._id).then(currentUser => {
		res.json({ notifications: currentUser?.notifications });
	});
};

// Route -> /api/user/tracks
// Access -> Private
export const getTracks = (req: Request, res: Response) => {
	const user = req.user as IUser;

	User.findById(user._id).then(currentUser => {
		res.json({ tracks: currentUser?.tracks });
	});
};

// Route -> /api/user/all-users
// Access -> SuperAdmin
export const getAllUsers = (req: Request, res: Response) => {
	User.find({}).then(users => {
		res.json({ users });
	});
};
