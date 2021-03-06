import express, { Application } from 'express';
import passport from 'passport';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

// Set environment variables
if (process.env.NODE_ENV === 'test') {
	dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
} else {
	dotenv.config();
}

// Local imports
import './config/passport';
import connectDB from './config/db';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/api/users';
import tagRoutes from './routes/api/tags';
import tutorialRoutes from './routes/api/tutorials';
import trackRoutes from './routes/api/tracks';
import feedbackRoutes from './routes/api/feedbacks';

connectDB();

const app: Application = express();

// Enable CORS
app.use(cors());

// Parse to JSON
app.use(express.json());

// Cookie session
app.use(
	cookieSession({
		maxAge: 24 * 60 * 60 * 100, // One day
		keys: [process.env.COOKIE_KEY || '']
	})
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/feedbacks', feedbackRoutes);

const PORT = process.env.PORT || 5000;

// Avoid running server in test env
if (process.env.NODE_ENV !== 'test') {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} environment`);
	});
}

export { app };
