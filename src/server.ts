import express, { Application } from 'express';
import passport from 'passport';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import path from 'path';

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
import tagRoutes from './routes/api/tags';

connectDB();

const app: Application = express();

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
app.use('/api/tags', tagRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} environment`));

export { app };
