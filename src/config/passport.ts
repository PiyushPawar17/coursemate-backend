import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import User from '../models/User';
import { IUser } from '../models/types';

const { GOOGLE_CLIENT_ID = '', GOOGLE_CLIENT_SECRET = '', HOST = '' } = process.env;

passport.serializeUser((user: IUser, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id)
		.then((currentUser: IUser | null) => {
			if (!currentUser) {
				return done(null, false);
			}

			const { _id, name, email, displayPicture, isAdmin, isSuperAdmin } = currentUser;
			const user = {
				_id,
				name,
				email,
				displayPicture,
				isAdmin,
				isSuperAdmin
			};
			done(null, user);
		})
		.catch(error => {
			done(error);
		});
});

passport.use(
	new GoogleStrategy(
		{
			// Options
			callbackURL: `${HOST}/auth/google/redirect`,
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		},
		(accessToken, refreshToken, profile, done) => {
			// Callback on redirection
			// Check if user exist
			User.findOne({ googleID: profile.id })
				.then(currentUser => {
					if (currentUser) {
						// User exist
						return done(undefined, currentUser);
					} else {
						// Create new user
						const newUser = new User({
							name: profile.displayName,
							googleID: profile.id,
							email: (profile.emails && profile.emails[0].value) || '',
							displayPicture: (profile.photos && profile.photos[0].value) || ''
						});

						newUser.save().then(user => {
							return done(undefined, user);
						});
					}
				})
				.catch(error => {
					return done(error);
				});
		}
	)
);
