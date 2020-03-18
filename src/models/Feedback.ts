import mongoose, { Schema } from 'mongoose';

import { IFeedback } from './types';

const FeedbackSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	title: {
		type: String,
		required: true,
		trim: true
	},
	message: {
		type: String,
		required: true,
		trim: true
	},
	isRead: {
		type: Boolean,
		default: false
	}
});

const Feedback = mongoose.model<IFeedback>('feedback', FeedbackSchema);

export default Feedback;
