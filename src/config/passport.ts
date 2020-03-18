import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import User from '../models/User';
import { IUser } from '../models/types';

const { GOOGLE_CLIENT_ID = '', GOOGLE_CLIENT_SECRET = '' } = process.env;

passport.serializeUser((user: IUser, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then(user => {
		done(null, user);
	});
});

passport.use(
	new GoogleStrategy(
		{
			// Options
			callbackURL: '/auth/google/redirect',
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		},
		(accessToken, refreshToken, profile, done) => {
			// Callback on redirection
			// Check if user exist
			User.findOne({ googleID: profile.id }).then(currentUser => {
				if (currentUser) {
					// User exist
					done(undefined, currentUser);
				} else {
					// Create new user
					const newUser = new User({
						name: profile.displayName,
						googleID: profile.id,
						email: profile.emails && profile.emails[0].value,
						displayPicture: profile.photos && profile.photos[0].value
					});

					newUser.save().then(user => {
						done(undefined, user);
					});
				}
			});
		}
	)
);
