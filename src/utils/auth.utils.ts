import { Request, Response, NextFunction } from 'express';

import { IUser } from '../models/types';

// Check if user is logged in
export const loginCheck = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		res.status(401).json({ error: 'You must be logged in to perform the action' });
	} else {
		next();
	}
};

// Check if user is admin
export const adminCheck = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		res.status(403).json({ error: 'You must be logged in to perform the action' });
	} else {
		const user = req.user as IUser;

		if (!user.isAdmin) {
			res.status(403).json({ error: 'Admin access required' });
		} else {
			next();
		}
	}
};

// Check if user is super admin
export const superAdminCheck = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		res.status(403).json({ error: 'You must be logged in to perform the action' });
	} else {
		const user = req.user as IUser;

		if (!user.isSuperAdmin) {
			res.status(403).json({ error: 'SuperAdmin access required' });
		} else {
			next();
		}
	}
};
