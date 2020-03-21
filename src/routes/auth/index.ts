import { Router, Request, Response } from 'express';
import passport from 'passport';

const router = Router();

// Routes for /auth

// --- GET Requests ---

// Route -> /auth/google
// Access -> Public
router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
	})
);

// Route -> /auth/google/redirect
// Access -> Private
router.get('/google/redirect', passport.authenticate('google'), (req: Request, res: Response) => {
	res.redirect('/');
});

// Route -> /auth/logout
// Access -> Private
router.get('/logout', (req: Request, res: Response) => {
	req.logOut();
	res.redirect('/');
});

export default router;
